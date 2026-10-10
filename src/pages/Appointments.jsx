import { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchAppointments, createAppointment, rescheduleAppointment, cancelAppointment } from '../store/slices/appointmentSlice'
import { fetchDoctors } from '../store/slices/doctorSlice'
import { fetchPatients } from '../store/slices/patientSlice'
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Stethoscope,
  Eye,
  CalendarClock,
  Ban,
  ArrowRight,
  Hash,
  Activity,
  FileText,
  X
} from 'lucide-react'
import { formatDate } from '../utils/formatters'

const TIME_SLOTS = [
  '09:00 AM - 09:30 AM',
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM',
  '11:30 AM - 12:00 PM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '03:00 PM - 03:30 PM',
  '03:30 PM - 04:00 PM',
  '04:00 PM - 04:30 PM',
  '04:30 PM - 05:00 PM',
]

const Appointments = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { appointments, loading } = useSelector((state) => state.appointments)
  const { doctors } = useSelector((state) => state.doctors)
  const { patients } = useSelector((state) => state.patients)
  const { user } = useSelector((state) => state.auth)

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  // Filtering state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Forms state
  const [createForm, setCreateForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    timeSlot: '09:00 AM - 09:30 AM',
    reasonForVisit: '',
  })

  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: '',
    timeSlot: '09:00 AM - 09:30 AM',
    reason: '',
  })

  const [cancelForm, setCancelForm] = useState({
    reasonCategory: 'Patient requested cancellation',
    customNotes: '',
  })

  useEffect(() => {
    dispatch(fetchAppointments())
    dispatch(fetchDoctors())
    dispatch(fetchPatients())
  }, [dispatch])

  // Get patient & doctor helpers
  const getPatient = (patientId) => patients.find((p) => p.id === patientId)
  const getDoctor = (doctorId) => doctors.find((d) => d.id === doctorId)

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const patient = getPatient(apt.patientId)
      const doctor = getDoctor(apt.doctorId)
      const searchLower = searchTerm.toLowerCase()

      const matchesSearch =
        (apt.appointmentNumber && apt.appointmentNumber.toLowerCase().includes(searchLower)) ||
        (apt.reasonForVisit && apt.reasonForVisit.toLowerCase().includes(searchLower)) ||
        (patient && `${patient.firstName} ${patient.lastName} ${patient.patientCode}`.toLowerCase().includes(searchLower)) ||
        (doctor && `${doctor.doctorCode} ${doctor.specialization}`.toLowerCase().includes(searchLower))

      const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [appointments, searchTerm, statusFilter, patients, doctors])

  // Statistics counters
  const totalCount = appointments.length
  const scheduledCount = appointments.filter((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length
  const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    dispatch(createAppointment(createForm))
    setShowCreateModal(false)
    setCreateForm({
      patientId: '',
      doctorId: '',
      appointmentDate: '',
      timeSlot: '09:00 AM - 09:30 AM',
      reasonForVisit: '',
    })
  }

  const openRescheduleModal = (apt) => {
    setSelectedAppointment(apt)
    setRescheduleForm({
      appointmentDate: apt.appointmentDate || '',
      timeSlot: apt.timeSlot || '09:00 AM - 09:30 AM',
      reason: '',
    })
    setShowRescheduleModal(true)
  }

  const handleRescheduleSubmit = (e) => {
    e.preventDefault()
    if (!selectedAppointment) return

    dispatch(
      rescheduleAppointment({
        id: selectedAppointment.id,
        data: {
          appointmentDate: rescheduleForm.appointmentDate,
          timeSlot: rescheduleForm.timeSlot,
          reason: rescheduleForm.reason || 'Rescheduled via clinical workstation',
        },
      })
    )
    setShowRescheduleModal(false)
  }

  const openCancelModal = (apt) => {
    setSelectedAppointment(apt)
    setCancelForm({
      reasonCategory: 'Patient requested cancellation',
      customNotes: '',
    })
    setShowCancelModal(true)
  }

  const handleCancelSubmit = (e) => {
    e.preventDefault()
    if (!selectedAppointment) return

    const combinedReason = cancelForm.customNotes
      ? `${cancelForm.reasonCategory}: ${cancelForm.customNotes}`
      : cancelForm.reasonCategory

    dispatch(cancelAppointment({ id: selectedAppointment.id, reason: combinedReason }))
    setShowCancelModal(false)
  }

  const openDetailsModal = (apt) => {
    setSelectedAppointment(apt)
    setShowDetailsModal(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge-completed">Completed</span>
      case 'CANCELLED':
        return <span className="badge-cancelled">Cancelled</span>
      case 'PENDING':
        return <span className="badge-pending">Pending</span>
      default:
        return <span className="badge-scheduled">Scheduled</span>
    }
  }

  const canCreateAppointment = user?.role === 'RECEPTIONIST' || user?.role === 'CLINIC_ADMIN' || user?.role === 'PATIENT'
  const isDoctor = user?.role === 'DOCTOR'

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E6F0]">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8278E8] uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-[#E94E9B]" />
            <span>Clinical Scheduling</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#37318B] tracking-tight mt-0.5">Appointments & Queue</h1>
          <p className="text-xs text-[#777789] font-medium">Manage outpatient consultations, queue tokens, and physician assignments.</p>
        </div>
        {canCreateAppointment && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        )}
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="smart-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#777789]">Total Bookings</p>
            <p className="text-xl font-extrabold text-[#37318B] mt-0.5">{totalCount}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#EEEBFF] text-[#37318B] flex items-center justify-center border border-[#D5D1FF]">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="smart-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#777789]">Scheduled Queue</p>
            <p className="text-xl font-extrabold text-[#0284C7] mt-0.5">{scheduledCount}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#DFF6FC] text-[#0284C7] flex items-center justify-center border border-[#BAE6FD]">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="smart-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#777789]">Completed Visits</p>
            <p className="text-xl font-extrabold text-[#10B981] mt-0.5">{completedCount}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#E8F8F0] text-[#10B981] flex items-center justify-center border border-[#A7F3D0]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="smart-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#777789]">Cancelled</p>
            <p className="text-xl font-extrabold text-[#EF4444] mt-0.5">{cancelledCount}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FDF0F0] text-[#EF4444] flex items-center justify-center border border-[#FECDD3]">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="smart-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
          <input
            type="text"
            placeholder="Search by patient, doctor, code, token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#E8E6F0] rounded-xl text-[#292743] placeholder-[#777789]/60 focus:outline-none focus:border-[#8278E8] focus:ring-2 focus:ring-[#8278E8]/15 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#EEEBFF] text-[#37318B] border border-[#D5D1FF] shadow-sm font-bold'
                  : 'bg-[#FBFBFF] text-[#777789] hover:bg-[#F0EFFF] border border-[#E8E6F0]'
              }`}
            >
              {st === 'ALL' ? 'All Bookings' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Master Table */}
      <div className="smart-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="table-header-cell rounded-l-xl">Appointment & Token</th>
                <th className="table-header-cell">Patient Details</th>
                <th className="table-header-cell">Attending Physician</th>
                <th className="table-header-cell">Schedule Slot</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-xs text-[#777789]">
                    <div className="inline-block w-6 h-6 border-2 border-[#8278E8] border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading appointments calendar...</p>
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-xs text-[#777789]">
                    <Calendar className="w-10 h-10 text-[#D5D1FF] mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#37318B]">No appointments found</p>
                    <p className="mt-1">Try adjusting your filter or book a new appointment.</p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const patient = getPatient(apt.patientId)
                  const doctor = getDoctor(apt.doctorId)

                  return (
                    <tr key={apt.id} className="table-body-row">
                      {/* Appointment # & Token */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#292743]">
                          #{apt.appointmentNumber}
                        </div>
                        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#EEEBFF] text-[#37318B] border border-[#D5D1FF]">
                          <Hash className="w-3 h-3 text-[#8278E8]" /> Token {apt.tokenNumber || '1'}
                        </div>
                      </td>

                      {/* Patient Details */}
                      <td className="px-4 py-3.5">
                        {patient ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#EEEBFF] text-[#37318B] flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 border border-[#D5D1FF]">
                              {patient.firstName?.[0]}
                              {patient.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-[#292743] leading-tight">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-[11px] text-[#777789] font-mono mt-0.5">{patient.patientCode}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#777789] text-xs">Patient #{apt.patientId}</span>
                        )}
                      </td>

                      {/* Doctor Assigned */}
                      <td className="px-4 py-3.5">
                        {doctor ? (
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-[#8278E8] flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-[#292743] leading-tight">Dr. {doctor.doctorCode}</p>
                              <span className="text-[10px] text-[#0284C7] bg-[#DFF6FC] px-1.5 py-0.5 rounded-full border border-[#BAE6FD] inline-block mt-0.5">
                                {doctor.specialization}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#777789] text-xs">Doctor #{apt.doctorId}</span>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[#292743] text-xs">{formatDate(apt.appointmentDate)}</div>
                        <div className="text-[11px] text-[#777789] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-[#777789]" />
                          {apt.timeSlot}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {getStatusBadge(apt.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            onClick={() => openDetailsModal(apt)}
                            className="p-1.5 text-[#777789] hover:text-[#37318B] hover:bg-[#EEEBFF] rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Doctor Quick Action: Start Consultation */}
                          {isDoctor && (apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                            <button
                              onClick={() => navigate(`/consultations?appointmentId=${apt.id}`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#EEEBFF] hover:bg-[#D5D1FF] text-[#37318B] text-xs font-bold rounded-lg border border-[#D5D1FF] transition"
                              title="Begin Clinical Consultation"
                            >
                              <Activity className="w-3.5 h-3.5 text-[#E94E9B]" />
                              Consult
                            </button>
                          )}

                          {/* Reschedule & Cancel for active appointments */}
                          {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                            <>
                              <button
                                onClick={() => openRescheduleModal(apt)}
                                className="p-1.5 text-[#777789] hover:text-[#8278E8] hover:bg-[#EEEBFF] rounded-lg transition"
                                title="Reschedule Appointment"
                              >
                                <CalendarClock className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openCancelModal(apt)}
                                className="p-1.5 text-[#777789] hover:text-[#EF4444] hover:bg-[#FDF0F0] rounded-lg transition"
                                title="Cancel Appointment"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE APPOINTMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#292743]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 border border-[#E8E6F0] shadow-modal max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E6F0]">
              <div>
                <h2 className="text-lg font-bold text-[#37318B]">Book New Appointment</h2>
                <p className="text-xs text-[#777789] mt-0.5">Register a scheduled consultation in the clinic calendar.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-[#777789] hover:text-[#37318B] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                  Select Patient *
                </label>
                <select
                  value={createForm.patientId}
                  onChange={(e) => setCreateForm({ ...createForm, patientId: e.target.value })}
                  className="input-control"
                  required
                >
                  <option value="">Choose patient record...</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} ({patient.patientCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                  Attending Physician *
                </label>
                <select
                  value={createForm.doctorId}
                  onChange={(e) => setCreateForm({ ...createForm, doctorId: e.target.value })}
                  className="input-control"
                  required
                >
                  <option value="">Select Doctor...</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.doctorCode} — {doctor.specialization} (Fee: ₹{doctor.consultationFee})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={createForm.appointmentDate}
                    onChange={(e) => setCreateForm({ ...createForm, appointmentDate: e.target.value })}
                    className="input-control"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                    Time Slot *
                  </label>
                  <select
                    value={createForm.timeSlot}
                    onChange={(e) => setCreateForm({ ...createForm, timeSlot: e.target.value })}
                    className="input-control"
                    required
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                  Reason for Consultation
                </label>
                <textarea
                  value={createForm.reasonForVisit}
                  onChange={(e) => setCreateForm({ ...createForm, reasonForVisit: e.target.value })}
                  rows={3}
                  className="input-control resize-none"
                  placeholder="e.g. Routine blood pressure checkup, fever, seasonal allergy..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#E8E6F0]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-[#292743]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-[#E8E6F0] shadow-modal animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E6F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EEEBFF] text-[#37318B] flex items-center justify-center">
                  <CalendarClock className="w-4 h-4 text-[#8278E8]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#37318B]">Reschedule Appointment</h3>
                  <p className="text-xs text-[#777789]">#{selectedAppointment.appointmentNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="p-1 text-[#777789] hover:text-[#37318B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 pt-4">
              <div className="p-3 bg-[#FBFBFF] rounded-xl border border-[#E8E6F0] text-xs space-y-1 text-[#777789]">
                <div className="flex justify-between">
                  <span>Current Date:</span>
                  <span className="font-semibold text-[#292743]">{formatDate(selectedAppointment.appointmentDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Slot:</span>
                  <span className="font-semibold text-[#292743]">{selectedAppointment.timeSlot}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                  New Appointment Date *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleForm.appointmentDate}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, appointmentDate: e.target.value })}
                  className="input-control"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                  New Time Slot *
                </label>
                <select
                  value={rescheduleForm.timeSlot}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, timeSlot: e.target.value })}
                  className="input-control"
                  required
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                  Reason for Rescheduling
                </label>
                <input
                  type="text"
                  placeholder="e.g. Patient requested morning shift"
                  value={rescheduleForm.reason}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                  className="input-control"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#E8E6F0]">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Confirm Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-[#292743]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-[#E8E6F0] shadow-modal animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E6F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FDF0F0] text-[#EF4444] flex items-center justify-center">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#37318B]">Cancel Appointment</h3>
                  <p className="text-xs text-[#777789]">#{selectedAppointment.appointmentNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 text-[#777789] hover:text-[#37318B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4 pt-4">
              <p className="text-xs text-[#EF4444] bg-[#FDF0F0] p-3 rounded-xl border border-rose-200">
                Warning: Cancelling this appointment will release token #{selectedAppointment.tokenNumber} and notify the patient.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                  Cancellation Reason Category *
                </label>
                <select
                  value={cancelForm.reasonCategory}
                  onChange={(e) => setCancelForm({ ...cancelForm, reasonCategory: e.target.value })}
                  className="input-control"
                  required
                >
                  <option value="Patient requested cancellation">Patient requested cancellation</option>
                  <option value="Doctor emergency / Unavailable">Doctor emergency / Unavailable</option>
                  <option value="Patient admitted elsewhere">Patient admitted elsewhere</option>
                  <option value="Duplicate booking">Duplicate booking</option>
                  <option value="Patient failed to confirm">Patient failed to confirm</option>
                  <option value="Other clinical reasons">Other clinical reasons</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context for clinical record..."
                  value={cancelForm.customNotes}
                  onChange={(e) => setCancelForm({ ...cancelForm, customNotes: e.target.value })}
                  className="input-control resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#E8E6F0]">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="btn-secondary flex-1"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  className="btn-danger flex-1"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPOINTMENT DOSSIER / DETAILS MODAL */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-[#292743]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 border border-[#E8E6F0] shadow-modal animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E6F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EEEBFF] text-[#37318B] flex items-center justify-center border border-[#D5D1FF]">
                  <FileText className="w-5 h-5 text-[#8278E8]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#37318B] text-base">Appointment Dossier</h3>
                  <p className="text-xs text-[#777789] font-mono">#{selectedAppointment.appointmentNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 text-[#777789] hover:text-[#37318B] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#FBFBFF] rounded-xl border border-[#E8E6F0]">
                <div>
                  <span className="text-[#777789] block">Queue Token:</span>
                  <span className="font-bold text-[#37318B] text-sm font-mono">#{selectedAppointment.tokenNumber}</span>
                </div>
                <div>
                  <span className="text-[#777789] block">Status:</span>
                  <span className="mt-0.5 inline-block">{getStatusBadge(selectedAppointment.status)}</span>
                </div>
                <div>
                  <span className="text-[#777789] block">Visit Date:</span>
                  <span className="font-semibold text-[#292743]">{formatDate(selectedAppointment.appointmentDate)}</span>
                </div>
                <div>
                  <span className="text-[#777789] block">Allocated Slot:</span>
                  <span className="font-semibold text-[#292743]">{selectedAppointment.timeSlot}</span>
                </div>
              </div>

              {/* Patient Card */}
              {getPatient(selectedAppointment.patientId) && (
                <div className="p-3.5 border border-[#E8E6F0] rounded-xl bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-[#8278E8]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#37318B]">Patient Profile</span>
                  </div>
                  {(() => {
                    const p = getPatient(selectedAppointment.patientId)
                    return (
                      <div className="grid grid-cols-2 gap-2 text-[#777789]">
                        <div>
                          <span>Name: </span><strong className="text-[#292743]">{p.firstName} {p.lastName}</strong>
                        </div>
                        <div>
                          <span>MRN Code: </span><span className="font-mono text-[#8278E8] font-bold">{p.patientCode}</span>
                        </div>
                        <div>
                          <span>Phone: </span><span className="text-[#292743]">{p.phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span>Blood Group: </span><strong className="text-[#37318B]">{p.bloodGroup || 'N/A'}</strong>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Doctor Card */}
              {getDoctor(selectedAppointment.doctorId) && (
                <div className="p-3.5 border border-[#E8E6F0] rounded-xl bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-4 h-4 text-[#E94E9B]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#37318B]">Attending Clinician</span>
                  </div>
                  {(() => {
                    const d = getDoctor(selectedAppointment.doctorId)
                    return (
                      <div className="grid grid-cols-2 gap-2 text-[#777789]">
                        <div>
                          <span>Doctor: </span><strong className="text-[#292743]">Dr. {d.doctorCode}</strong>
                        </div>
                        <div>
                          <span>Specialty: </span><span className="badge-purple">{d.specialization}</span>
                        </div>
                        <div>
                          <span>Room: </span><span className="text-[#292743]">{d.roomNumber || 'Consultation Suite'}</span>
                        </div>
                        <div>
                          <span>Standard Fee: </span><strong className="text-[#10B981]">₹{d.consultationFee}</strong>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Reason for Visit */}
              <div className="p-3 bg-[#FBFBFF] border border-[#E8E6F0] rounded-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777789] block mb-1">Chief Reason for Visit</span>
                <p className="text-xs text-[#292743]">
                  {selectedAppointment.reasonForVisit || 'General medical examination and clinical consultation.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E8E6F0]">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn-secondary text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Appointments
