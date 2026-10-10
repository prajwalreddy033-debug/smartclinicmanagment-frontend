import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import api from '../store/api'
import {
  CalendarDays,
  Clock,
  Stethoscope,
  Activity,
  MapPin,
  CheckCircle2,
  User,
  Loader2,
  AlertCircle,
  CalendarCheck,
  ArrowLeft,
  Sparkles,
  DollarSign
} from 'lucide-react'

// 30 min average consultation time used for waiting-time estimates
const AVG_CONSULT = 30
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const ACTIVE_STATUSES = ['SCHEDULED', 'CONFIRMED']

/* ---------------- helpers ---------------- */

function fmt12(h, m) {
  const ap = h >= 12 ? 'PM' : 'AM'
  let hh = h % 12
  if (hh === 0) hh = 12
  return `${hh}:${String(m).padStart(2, '0')} ${ap}`
}

function slotStartMinutes(value) {
  const m = value.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/)
  if (!m) return 0
  let h = parseInt(m[1], 10) % 12
  if (m[3] === 'PM') h += 12
  return h * 60 + parseInt(m[2], 10)
}

function toISODate(d) {
  const y = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

function fmtDateLabel(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function makeSlots(fromStr, toStr) {
  const [fh, fm] = fromStr.split(':').map(Number)
  const [th, tm] = toStr.split(':').map(Number)
  const start = fh * 60 + fm
  const end = th * 60 + tm
  const slots = []
  for (let t = start; t + AVG_CONSULT <= end; t += AVG_CONSULT) {
    const h = Math.floor(t / 60)
    const m = t % 60
    const h2 = Math.floor((t + AVG_CONSULT) / 60)
    const m2 = (t + AVG_CONSULT) % 60
    slots.push({
      value: `${fmt12(h, m)} - ${fmt12(h2, m2)}`,
      start: t,
    })
  }
  return slots
}

function waitBadge(count) {
  if (count <= 0) return { label: 'No wait time', color: 'bg-[#E8F8F0] text-[#10B981] border-[#A7F3D0]' }
  if (count <= 2) return { label: `${count * AVG_CONSULT} min avg wait`, color: 'bg-[#DFF6FC] text-[#0284C7] border-[#BAE6FD]' }
  if (count <= 5) return { label: `${count * AVG_CONSULT} min avg wait`, color: 'bg-[#FEF6E7] text-[#D97706] border-[#FDE68A]' }
  return { label: `${count * AVG_CONSULT}+ min avg wait`, color: 'bg-[#FDF0F0] text-[#EF4444] border-[#FECDD3]' }
}

function minutesLabel(min) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}m` : `${h} hour${h > 1 ? 's' : ''}`
}

/* ---------------- page ---------------- */

const BookAppointment = () => {
  const { user } = useSelector((state) => state.auth)

  const [doctors, setDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [category, setCategory] = useState('All')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [dates, setDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [reason, setReason] = useState('')
  const [apptsByDoctor, setApptsByDoctor] = useState({})
  const [loadingAppts, setLoadingAppts] = useState(false)

  const [booking, setBooking] = useState(false)
  const [bookError, setBookError] = useState('')
  const [booked, setBooked] = useState(null)

  const patientId = user?.patientId

  /* build the next-14-day list once */
  useEffect(() => {
    const list = []
    for (let i = 0; i < 14; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      list.push(d)
    }
    setDates(list)
    setSelectedDate(list[0])
  }, [])

  /* load doctors */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/doctors')
        const list = res.data?.data || []
        setDoctors(list.filter((d) => d.status === 'ACTIVE'))
      } catch (e) {
        setLoadError(e.response?.data?.message || 'Could not load doctors')
      } finally {
        setLoadingDoctors(false)
      }
    }
    load()
  }, [])

  /* load the day's appointments whenever the selected date changes */
  useEffect(() => {
    if (!selectedDate) return
    let active = true
    setLoadingAppts(true)
    const iso = toISODate(selectedDate)
    api
      .get('/appointments', { params: { date: iso, size: 500 } })
      .then((res) => {
        const content = res.data?.data?.content || []
        const byDoctor = {}
        for (const a of content) {
          if (!ACTIVE_STATUSES.includes(a.status) || !a.doctorId) continue
          if (!byDoctor[a.doctorId]) byDoctor[a.doctorId] = []
          byDoctor[a.doctorId].push(a)
        }
        if (active) setApptsByDoctor(byDoctor)
      })
      .catch(() => { if (active) setApptsByDoctor({}) })
      .finally(() => { if (active) setLoadingAppts(false) })
    return () => { active = false }
  }, [selectedDate])

  const categories = useMemo(() => {
    const map = {}
    for (const d of doctors) map[d.specialization] = (map[d.specialization] || 0) + 1
    return Object.keys(map).sort()
  }, [doctors])

  const filteredDoctors = useMemo(() => {
    if (category === 'All') return doctors
    return doctors.filter((d) => d.specialization === category)
  }, [doctors, category])

  const doctorAvailableOn = useCallback((doctor, date) => {
    const dayCode = DAYS[date.getDay()]
    return (doctor.availableDays || '').split(',').includes(dayCode)
  }, [])

  const slotsFor = useMemo(() => {
    if (!selectedDoctor) return []
    return makeSlots(selectedDoctor.availableFrom || '09:00:00', selectedDoctor.availableTo || '17:00:00')
  }, [selectedDoctor])

  const busySlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return new Set()
    const list = apptsByDoctor[selectedDoctor.id] || []
    return new Set(list.map((a) => a.timeSlot))
  }, [selectedDoctor, selectedDate, apptsByDoctor])

  const patientsAhead = useMemo(() => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return 0
    const list = apptsByDoctor[selectedDoctor.id] || []
    return list.filter((a) => slotStartMinutes(a.timeSlot) < slotStartMinutes(selectedSlot)).length
  }, [selectedDoctor, selectedDate, selectedSlot, apptsByDoctor])

  const todayCount = (doctor) => (apptsByDoctor[doctor.id] || []).length

  const selectDoctor = (doctor) => {
    setSelectedDoctor(doctor)
    setSelectedSlot(null)
    setReason('')
    setBookError('')
    setBooked(null)
    // reset to the first day the doctor works
    const first = dates.find((d) => doctorAvailableOn(doctor, d))
    if (first) setSelectedDate(first)
  }

  const submitBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return
    setBooking(true)
    setBookError('')
    try {
      const res = await api.post('/appointments', {
        clinicId: selectedDoctor.clinicId,
        patientId,
        doctorId: selectedDoctor.id,
        appointmentDate: toISODate(selectedDate),
        timeSlot: selectedSlot,
        reasonForVisit: reason,
      })
      setBooked(res.data.data)
    } catch (e) {
      setBookError(e.response?.data?.message || 'Booking failed — try another slot')
    } finally {
      setBooking(false)
    }
  }

  /* ---- not a patient ---- */
  if (!patientId) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <div className="smart-card p-10 text-center">
          <div className="w-14 h-14 mx-auto bg-[#EEEBFF] rounded-2xl flex items-center justify-center mb-4 text-[#37318B] border border-[#D5D1FF]">
            <User className="w-7 h-7 text-[#E94E9B]" />
          </div>
          <h1 className="text-xl font-extrabold text-[#37318B] mb-2">Book an Appointment</h1>
          <p className="text-xs text-[#777789] mb-6 leading-relaxed">
            The direct booking widget is dedicated to <strong className="text-[#37318B]">registered patients</strong>. Switch to the demo patient account or sign in to browse live waiting times.
          </p>
          <div className="bg-[#FBFBFF] border border-[#E8E6F0] rounded-xl p-4 text-left text-xs">
            <p className="font-bold text-[#37318B] mb-1">Demo Patient Persona:</p>
            <p className="text-[#777789]">Username: <span className="text-[#292743] font-semibold">john.doe@gmail.com</span></p>
            <p className="text-[#777789]">Password: <span className="text-[#292743] font-semibold">Admin@123</span></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E6F0]">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8278E8] uppercase tracking-wider">
            <CalendarCheck className="w-3.5 h-3.5 text-[#E94E9B]" />
            <span>Outpatient Booking & Wait Times</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#37318B] tracking-tight mt-0.5">Book Doctor Consultation</h1>
          <p className="text-xs text-[#777789] font-medium">
            Browse available specialists, inspect live queue wait times, and reserve your consultation token.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#FBFBFF] border border-[#E8E6F0] rounded-xl px-4 py-2 shadow-soft self-start sm:self-auto">
          <div className="w-8 h-8 bg-[#EEEBFF] rounded-lg flex items-center justify-center font-bold text-xs text-[#37318B] border border-[#D5D1FF]">
            {user?.fullName?.charAt(0)}
          </div>
          <div>
            <p className="text-[10px] text-[#777789]">Booking as Patient</p>
            <p className="text-xs font-bold text-[#292743]">{user?.fullName}</p>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="p-3.5 bg-[#FDF0F0] border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-[#EF4444]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', ...categories].map((cat) => {
          const count = cat === 'All' ? doctors.length : categories ? doctors.filter((d) => d.specialization === cat).length : 0
          const active = category === cat
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition duration-150 ${
                active
                  ? 'bg-[#EEEBFF] text-[#37318B] border-[#D5D1FF] shadow-sm font-bold'
                  : 'bg-white text-[#777789] border-[#E8E6F0] hover:bg-[#F0EFFF]/60'
              }`}
            >
              <span>{cat === 'All' ? 'All Specialists' : cat}</span>
              <span className={`ml-1 text-[11px] ${active ? 'text-[#8278E8]' : 'text-[#777789]/60'}`}>({count})</span>
            </button>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
        {/* Doctor Directory Cards */}
        <div>
          {loadingDoctors ? (
            <div className="smart-card p-16 text-center text-xs text-[#777789]">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8278E8]" />
              <p>Loading clinic physicians...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="smart-card p-12 text-center text-xs text-[#777789]">
              <Stethoscope className="w-10 h-10 text-[#D5D1FF] mx-auto mb-2" />
              <p className="font-semibold text-sm text-[#37318B]">No doctors found for “{category}”</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredDoctors.map((doctor) => {
                const count = todayCount(doctor)
                const badge = waitBadge(count)
                const availToday = doctorAvailableOn(doctor, selectedDate)
                const isSelected = selectedDoctor?.id === doctor.id
                return (
                  <button
                    key={doctor.id}
                    onClick={() => selectDoctor(doctor)}
                    className={`text-left smart-card p-5 transition duration-150 relative ${
                      isSelected
                        ? 'border-[#E94E9B] ring-2 ring-[#E94E9B]/20 shadow-card'
                        : 'hover:border-[#8278E8]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-[#EEEBFF] text-[#37318B] border border-[#D5D1FF] rounded-xl flex items-center justify-center font-bold">
                          <Stethoscope className="w-5 h-5 text-[#8278E8]" />
                        </div>
                        <div>
                          <p className="font-bold text-[#292743] leading-tight text-sm">{doctor.fullName}</p>
                          <p className="text-xs text-[#8278E8] font-semibold mt-0.5">{doctor.specialization}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#777789]">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-[#8278E8]" />
                        <span>{doctor.qualification}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#8278E8]" />
                        <span>{doctor.clinicName || 'Metro Health Clinic'}</span>
                        <span className="text-[10px] text-[#777789]">({doctor.experienceYears} yrs exp)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#8278E8]" />
                        <span>
                          {doctor.availableDays} • {doctor.availableFrom ? fmt12(+doctor.availableFrom.split(':')[0], +doctor.availableFrom.split(':')[1]) : '09:00 AM'} - {doctor.availableTo ? fmt12(+doctor.availableTo.split(':')[0], +doctor.availableTo.split(':')[1]) : '05:00 PM'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E8E6F0] flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#292743]">
                        <span className="text-xs text-[#777789]">Consultation Fee:</span>
                        <span className="font-bold text-sm text-[#10B981]">₹{doctor.consultationFee}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          availToday
                            ? 'bg-[#E8F8F0] text-[#10B981] border-[#A7F3D0]'
                            : 'bg-[#FBFBFF] text-[#777789] border-[#E8E6F0]'
                        }`}
                      >
                        {loadingAppts ? 'Checking…' : availToday ? 'Available Today' : 'Different Days'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Sticky Booking Panel */}
        <div className="lg:sticky lg:top-4">
          {booked ? (
            <div className="smart-card border-[#A7F3D0] p-6 animate-in fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-[#E8F8F0] text-[#10B981] rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#37318B] text-base">Appointment Booked!</h2>
                  <p className="text-xs text-[#777789]">Token #{booked.tokenNumber} • #{booked.appointmentNumber}</p>
                </div>
              </div>

              <div className="rounded-xl bg-[#FBFBFF] border border-[#E8E6F0] p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#777789]">Doctor</span>
                  <span className="font-semibold text-[#292743]">{booked.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777789]">Specialization</span>
                  <span className="font-semibold text-[#8278E8]">{booked.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777789]">Date</span>
                  <span className="font-semibold text-[#292743]">{fmtDateLabel(new Date(booked.appointmentDate + 'T00:00:00'))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777789]">Time Slot</span>
                  <span className="font-semibold text-[#292743]">{booked.timeSlot}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E8E6F0]">
                  <span className="text-[#777789]">Queue Token</span>
                  <span className="font-bold text-[#E94E9B]">#{booked.tokenNumber}</span>
                </div>
              </div>

              <button
                onClick={() => { setBooked(null); setSelectedDoctor(null); setSelectedSlot(null); setReason('') }}
                className="mt-4 w-full btn-primary"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Book Another Appointment</span>
              </button>
            </div>
          ) : selectedDoctor && selectedDate ? (
            <div className="smart-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-bold text-[#37318B] text-base">{selectedDoctor.fullName}</h2>
                  <p className="text-xs text-[#8278E8] font-semibold">{selectedDoctor.specialization}</p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-[#777789]">Fee</span>
                  <p className="text-[#10B981] font-bold text-base">₹{selectedDoctor.consultationFee}</p>
                </div>
              </div>

              <div className="mb-4 p-3 rounded-xl bg-[#DFF6FC] border border-[#BAE6FD] text-xs text-[#0284C7]">
                {patientsAhead > 0 ? (
                  <>
                    <span className="font-bold">{patientsAhead} patient{patientsAhead > 1 ? 's' : ''} ahead</span>{' '}
                    • estimated wait <span className="font-extrabold">{minutesLabel(patientsAhead * AVG_CONSULT)}</span>
                  </>
                ) : (
                  <span className="font-bold flex items-center gap-1.5 text-[#10B981]">
                    <CheckCircle2 className="w-4 h-4" /> Slot is open — minimal clinic waiting time
                  </span>
                )}
              </div>

              {/* Day Selection */}
              <p className="text-xs font-bold text-[#37318B] uppercase tracking-wider mb-2">Select Date</p>
              <div className="flex flex-wrap gap-1.5 mb-4 max-h-36 overflow-y-auto pr-1">
                {dates.map((d) => {
                  const ok = doctorAvailableOn(selectedDoctor, d)
                  const iso = toISODate(d)
                  const sel = selectedDate && toISODate(selectedDate) === iso
                  return (
                    <button
                      key={iso}
                      disabled={!ok}
                      onClick={() => { setSelectedDate(d); setSelectedSlot(null) }}
                      className={`px-3 py-2 rounded-xl border text-xs transition ${
                        sel
                          ? 'bg-[#E94E9B] text-white border-[#E94E9B] font-bold shadow-sm'
                          : ok
                          ? 'bg-white text-[#292743] border-[#E8E6F0] hover:bg-[#F0EFFF]'
                          : 'bg-[#FBFBFF] text-[#777789]/40 border-[#E8E6F0]/60 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-bold">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-[10px]">{d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
                    </button>
                  )
                })}
              </div>

              {!doctorAvailableOn(selectedDoctor, selectedDate) ? (
                <p className="text-xs text-[#D97706] bg-[#FEF6E7] border border-[#FDE68A] rounded-xl p-3 mb-4">
                  <AlertCircle className="inline w-3.5 h-3.5 mr-1" /> Physician is not on duty on this day. Please select an active day.
                </p>
              ) : (
                <>
                  <p className="text-xs font-bold text-[#37318B] uppercase tracking-wider mb-2">Select Time Slot</p>
                  <div className="grid grid-cols-2 gap-2 mb-4 max-h-48 overflow-y-auto pr-1">
                    {slotsFor.map((slot) => {
                      const busy = busySlots.has(slot.value)
                      const sel = selectedSlot === slot.value
                      return (
                        <button
                          key={slot.value}
                          disabled={busy}
                          onClick={() => setSelectedSlot(slot.value)}
                          className={`px-2.5 py-2 rounded-xl border text-xs font-medium transition ${
                            sel
                              ? 'bg-[#EEEBFF] text-[#37318B] border-[#8278E8] font-bold shadow-sm'
                              : busy
                              ? 'bg-[#FBFBFF] text-[#777789]/40 border-[#E8E6F0]/50 cursor-not-allowed'
                              : 'bg-white text-[#292743] border-[#E8E6F0] hover:border-[#8278E8]'
                          }`}
                        >
                          <div>{slot.value}</div>
                          {busy && <span className="block text-[9px] text-[#EF4444] font-bold">Booked</span>}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              <div className="mb-4">
                <label className="block text-xs font-bold text-[#37318B] mb-1">
                  Reason for Visit <span className="text-[#777789] font-normal">(Optional)</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="e.g. Health checkup, flu symptoms, consultation..."
                  className="input-control resize-none"
                />
              </div>

              {bookError && (
                <p className="mb-3 text-xs text-[#EF4444] bg-[#FDF0F0] border border-rose-200 rounded-xl p-2.5">
                  <AlertCircle className="inline w-3.5 h-3.5 mr-1" /> {bookError}
                </p>
              )}

              <button
                onClick={submitBooking}
                disabled={!selectedSlot || booking}
                className="w-full btn-primary"
              >
                {booking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reserving slot...</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4" />
                    <span>Confirm Booking {selectedSlot ? `• ${selectedSlot}` : ''}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="smart-card border-dashed p-8 text-center text-[#777789]">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 text-[#D5D1FF]" />
              <p className="font-bold text-sm text-[#37318B]">Choose a Doctor to Book</p>
              <p className="text-xs mt-1">Their schedule, time slots, and waiting times will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookAppointment