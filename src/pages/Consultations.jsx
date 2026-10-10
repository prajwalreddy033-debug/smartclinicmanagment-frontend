import { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchConsultations, createConsultation } from '../store/slices/consultationSlice'
import { fetchAppointments } from '../store/slices/appointmentSlice'
import {
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Plus,
  Search,
  Pill,
  FileText,
  Clock,
  ArrowRight,
  User,
  Calendar,
  AlertCircle,
  Scale,
  Eye,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  X
} from 'lucide-react'
import { formatDate } from '../utils/formatters'

const Consultations = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { consultations, loading } = useSelector((state) => state.consultations)
  const { appointments } = useSelector((state) => state.appointments)
  const { user } = useSelector((state) => state.auth)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterPrescription, setFilterPrescription] = useState('ALL') // ALL, PRESCRIBED, PENDING
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Clinical encounter form
  const [formData, setFormData] = useState({
    appointmentId: '',
    symptoms: '',
    diagnosis: '',
    vitalBp: '',
    vitalPulse: '',
    vitalTemp: '',
    vitalWeight: '',
    vitalSpo2: '',
    clinicalNotes: '',
    treatmentPlan: '',
  })

  useEffect(() => {
    dispatch(fetchConsultations())
    dispatch(fetchAppointments())
  }, [dispatch])

  // Check if routed with ?appointmentId from Appointments page
  useEffect(() => {
    const aptId = searchParams.get('appointmentId')
    if (aptId) {
      setFormData((prev) => ({ ...prev, appointmentId: aptId }))
      if (user?.role === 'DOCTOR' || user?.role === 'CLINIC_ADMIN' || user?.role === 'ADMIN') {
        setShowCreateModal(true)
      }
    }
  }, [searchParams, user?.role])

  // Available appointments for recording consultation
  const eligibleAppointments = useMemo(() => {
    const consultedAptIds = new Set(consultations.map((c) => c.appointmentId))
    return appointments.filter((apt) => {
      const isEligibleStatus = apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED' || apt.status === 'COMPLETED'
      return isEligibleStatus && !consultedAptIds.has(apt.id)
    })
  }, [appointments, consultations])

  // Filtered consultations
  const filteredConsultations = useMemo(() => {
    return consultations.filter((c) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        (c.patientName && c.patientName.toLowerCase().includes(searchLower)) ||
        (c.patientCode && c.patientCode.toLowerCase().includes(searchLower)) ||
        (c.diagnosis && c.diagnosis.toLowerCase().includes(searchLower)) ||
        (c.symptoms && c.symptoms.toLowerCase().includes(searchLower)) ||
        (c.appointmentNumber && c.appointmentNumber.toLowerCase().includes(searchLower))

      const matchesFilter =
        filterPrescription === 'ALL'
          ? true
          : filterPrescription === 'PRESCRIBED'
          ? c.hasPrescription
          : !c.hasPrescription

      return matchesSearch && matchesFilter
    })
  }, [consultations, searchTerm, filterPrescription])

  // KPI stats
  const totalEncounters = consultations.length
  const prescribedCount = consultations.filter((c) => c.hasPrescription).length
  const pendingRxCount = totalEncounters - prescribedCount

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    const payload = {
      appointmentId: Number(formData.appointmentId),
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis,
      vitalBp: formData.vitalBp || null,
      vitalPulse: formData.vitalPulse ? parseInt(formData.vitalPulse, 10) : null,
      vitalTemp: formData.vitalTemp || null,
      vitalWeight: formData.vitalWeight ? parseFloat(formData.vitalWeight) : null,
      vitalSpo2: formData.vitalSpo2 ? parseInt(formData.vitalSpo2, 10) : null,
      clinicalNotes: formData.clinicalNotes || null,
      treatmentPlan: formData.treatmentPlan || null,
    }

    const res = await dispatch(createConsultation(payload))
    setSubmitting(false)

    if (res.error) {
      setSubmitError(res.payload || 'Failed to record consultation encounter.')
    } else {
      setShowCreateModal(false)
      setFormData({
        appointmentId: '',
        symptoms: '',
        diagnosis: '',
        vitalBp: '',
        vitalPulse: '',
        vitalTemp: '',
        vitalWeight: '',
        vitalSpo2: '',
        clinicalNotes: '',
        treatmentPlan: '',
      })
      dispatch(fetchAppointments())
    }
  }

  const openDetails = (c) => {
    setSelectedConsultation(c)
    setShowDetailModal(true)
  }

  const canCreate = user?.role === 'DOCTOR' || user?.role === 'CLINIC_ADMIN' || user?.role === 'ADMIN'
  const isDoctor = user?.role === 'DOCTOR'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8E6F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8278E8] uppercase tracking-wider mb-1">
            <span className="w-6 h-6 rounded-lg bg-[#F0EFFF] flex items-center justify-center text-[#37318B]">
              <Stethoscope className="w-3.5 h-3.5" />
            </span>
            <span>Clinical Encounters & Notes</span>
          </div>
          <h1 className="text-2xl font-bold text-[#37318B] tracking-tight">Consultations Ledger</h1>
          <p className="text-sm text-[#777789] mt-0.5">
            Record patient examination vitals, chief complaints, differential diagnosis, and treatment regimens.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              setSubmitError(null)
              setShowCreateModal(true)
            }}
            className="btn-primary inline-flex items-center justify-center gap-2 shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Record Consultation
          </button>
        )}
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="smart-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#777789]">Total Encounters</p>
            <p className="text-2xl font-bold text-[#37318B] mt-1">{totalEncounters}</p>
            <p className="text-[11px] text-[#777789] mt-0.5">Clinical notes logged</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F0EFFF] flex items-center justify-center text-[#37318B]">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        <div className="smart-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#777789]">Prescriptions Issued</p>
            <p className="text-2xl font-bold text-[#8278E8] mt-1">{prescribedCount}</p>
            <p className="text-[11px] text-[#777789] mt-0.5">Rx generated & active</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#DFF6FC] flex items-center justify-center text-[#0284C7]">
            <Pill className="w-5 h-5" />
          </div>
        </div>

        <div className="smart-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#777789]">Pending Prescriptions</p>
            <p className="text-2xl font-bold text-[#D97706] mt-1">{pendingRxCount}</p>
            <p className="text-[11px] text-[#777789] mt-0.5">Awaiting medication orders</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FEF6E7] flex items-center justify-center text-[#D97706]">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="smart-card p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
            <input
              type="text"
              placeholder="Search by patient, code, diagnosis, symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-control pl-10"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterPrescription('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                filterPrescription === 'ALL'
                  ? 'bg-[#37318B] text-white shadow-sm'
                  : 'bg-[#F0EFFF] text-[#37318B] hover:bg-[#E8E6F0]'
              }`}
            >
              All Records ({totalEncounters})
            </button>
            <button
              onClick={() => setFilterPrescription('PRESCRIBED')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                filterPrescription === 'PRESCRIBED'
                  ? 'bg-[#8278E8] text-white shadow-sm'
                  : 'bg-[#F0EFFF] text-[#37318B] hover:bg-[#E8E6F0]'
              }`}
            >
              Rx Issued ({prescribedCount})
            </button>
            <button
              onClick={() => setFilterPrescription('PENDING')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                filterPrescription === 'PENDING'
                  ? 'bg-[#D97706] text-white shadow-sm'
                  : 'bg-[#F0EFFF] text-[#37318B] hover:bg-[#E8E6F0]'
              }`}
            >
              Rx Pending ({pendingRxCount})
            </button>
          </div>
        </div>
      </div>

      {/* Consultations Feed */}
      {loading ? (
        <div className="smart-card p-16 text-center text-[#777789]">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-3 border-[#8278E8] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium text-[#777789]">Loading clinical encounter history...</span>
          </div>
        </div>
      ) : filteredConsultations.length === 0 ? (
        <div className="smart-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F0EFFF] flex items-center justify-center text-[#8278E8] mx-auto mb-3">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-[#37318B] text-base">No consultation encounters found</h3>
          <p className="text-xs text-[#777789] mt-1 max-w-sm mx-auto">
            {canCreate
              ? 'Click "Record Consultation" above to document a completed appointment and log vitals & diagnosis.'
              : 'Consultation notes will appear here once reviewed and signed by attending physicians.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredConsultations.map((c) => (
            <div
              key={c.id}
              className="smart-card p-5 hover:border-[#8278E8]/40 transition duration-200"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#E8E6F0]">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0EFFF] text-[#37318B] flex items-center justify-center flex-shrink-0 font-bold shadow-sm">
                    <Stethoscope className="w-6 h-6 text-[#8278E8]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[#37318B] text-base">
                        {c.patientName || `Patient #${c.patientId}`}
                      </h3>
                      {c.patientCode && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-medium bg-[#F0EFFF] text-[#37318B] border border-[#E8E6F0]">
                          {c.patientCode}
                        </span>
                      )}
                      <span className="text-xs text-[#777789]">•</span>
                      <span className="text-xs text-[#777789] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[#777789] mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>Attending: <strong className="text-[#292743]">Dr. {c.doctorName}</strong></span>
                      {c.specialization && (
                        <span className="text-[#37318B] bg-[#F0EFFF] px-2 py-0.5 rounded-md text-[11px] font-medium border border-[#E8E6F0]">
                          {c.specialization}
                        </span>
                      )}
                      {c.appointmentNumber && (
                        <span className="text-[#777789] text-[11px]">
                          (Apt #{c.appointmentNumber})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {c.hasPrescription ? (
                    <span className="badge badge-completed flex items-center gap-1.5 font-semibold">
                      <Pill className="w-3.5 h-3.5 text-emerald-600" />
                      Rx Issued ({c.prescriptionNumber || 'PRX'})
                    </span>
                  ) : (
                    <span className="badge badge-pending flex items-center gap-1.5 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Rx Pending
                    </span>
                  )}

                  <button
                    onClick={() => openDetails(c)}
                    className="p-2 text-[#777789] hover:text-[#37318B] hover:bg-[#F0EFFF] rounded-xl transition border border-transparent hover:border-[#E8E6F0]"
                    title="View Full Encounter Record"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Patient Vitals Strip */}
              {(c.vitalBp || c.vitalPulse || c.vitalTemp || c.vitalSpo2 || c.vitalWeight) && (
                <div className="my-3.5 py-2.5 px-3.5 bg-[#F0EFFF]/60 rounded-xl border border-[#E8E6F0] flex flex-wrap items-center gap-4 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8278E8]">Vitals Recorded:</span>
                  {c.vitalBp && (
                    <div className="flex items-center gap-1.5 font-medium text-[#292743]">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>BP: <strong>{c.vitalBp}</strong></span>
                    </div>
                  )}
                  {c.vitalPulse && (
                    <div className="flex items-center gap-1.5 font-medium text-[#292743]">
                      <Activity className="w-3.5 h-3.5 text-sky-500" />
                      <span>Pulse: <strong>{c.vitalPulse} bpm</strong></span>
                    </div>
                  )}
                  {c.vitalSpo2 && (
                    <div className="flex items-center gap-1.5 font-medium text-[#292743]">
                      <Activity className="w-3.5 h-3.5 text-teal-500" />
                      <span>SpO2: <strong>{c.vitalSpo2}%</strong></span>
                    </div>
                  )}
                  {c.vitalTemp && (
                    <div className="flex items-center gap-1.5 font-medium text-[#292743]">
                      <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                      <span>Temp: <strong>{c.vitalTemp}</strong></span>
                    </div>
                  )}
                  {c.vitalWeight && (
                    <div className="flex items-center gap-1.5 font-medium text-[#292743]">
                      <Scale className="w-3.5 h-3.5 text-purple-500" />
                      <span>Weight: <strong>{c.vitalWeight} kg</strong></span>
                    </div>
                  )}
                </div>
              )}

              {/* Diagnosis & Symptoms */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-white rounded-xl border border-[#E8E6F0]">
                  <span className="text-[11px] font-bold text-[#777789] uppercase tracking-wider block mb-1">
                    Chief Symptoms
                  </span>
                  <p className="text-xs text-[#292743] leading-relaxed">{c.symptoms}</p>
                </div>
                <div className="p-3.5 bg-[#DFF6FC]/30 rounded-xl border border-[#DFF6FC]">
                  <span className="text-[11px] font-bold text-[#0284C7] uppercase tracking-wider block mb-1">
                    Clinical Diagnosis
                  </span>
                  <p className="text-xs text-[#37318B] font-semibold leading-relaxed">{c.diagnosis}</p>
                </div>
              </div>

              {/* Treatment Plan & Doctor Actions */}
              <div className="mt-4 pt-3 border-t border-[#E8E6F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-[#777789] flex-1">
                  {c.treatmentPlan ? (
                    <p>
                      <strong className="text-[#37318B]">Regimen: </strong>
                      <span className="text-[#292743]">{c.treatmentPlan}</span>
                    </p>
                  ) : (
                    <span className="text-[#777789] italic">No formal treatment plan entered.</span>
                  )}
                </div>

                {/* Doctor quick action to write prescription */}
                {isDoctor && !c.hasPrescription && (
                  <button
                    onClick={() => navigate(`/prescriptions?consultationId=${c.id}`)}
                    className="btn-primary inline-flex items-center gap-1.5 text-xs py-1.5 px-3.5 shadow-sm flex-shrink-0"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    Write Prescription
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RECORD CLINICAL ENCOUNTER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#292743]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl border border-[#E8E6F0] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E6F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0EFFF] text-[#37318B] flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-[#8278E8]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#37318B]">Record Clinical Encounter</h2>
                  <p className="text-xs text-[#777789]">Capture patient vitals, clinical diagnosis, and management plan.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F0EFFF] flex items-center justify-center text-[#777789] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitError && (
              <div className="mt-4 p-3 bg-[#FDF0F0] border border-[#EF4444]/20 text-[#EF4444] text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
              {/* Select Appointment */}
              <div>
                <label className="block text-xs font-semibold text-[#37318B] uppercase tracking-wider mb-1.5">
                  Select Associated Appointment *
                </label>
                <select
                  value={formData.appointmentId}
                  onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                  className="input-control"
                  required
                >
                  <option value="">Select appointment to consult...</option>
                  {eligibleAppointments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      #{apt.appointmentNumber} — Token {apt.tokenNumber} ({formatDate(apt.appointmentDate)} · {apt.timeSlot})
                    </option>
                  ))}
                </select>
                {eligibleAppointments.length === 0 && (
                  <p className="text-xs text-[#D97706] mt-1">
                    No open appointments pending consultation. Schedule an appointment first.
                  </p>
                )}
              </div>

              {/* Vitals Grid */}
              <div className="p-4 bg-[#F0EFFF]/60 rounded-2xl border border-[#E8E6F0] space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#8278E8]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#37318B]">Patient Vitals & Biometrics</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#777789] mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      placeholder="e.g. 120/80"
                      value={formData.vitalBp}
                      onChange={(e) => setFormData({ ...formData, vitalBp: e.target.value })}
                      className="input-control py-1.5 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#777789] mb-1">Pulse (bpm)</label>
                    <input
                      type="number"
                      placeholder="e.g. 72"
                      value={formData.vitalPulse}
                      onChange={(e) => setFormData({ ...formData, vitalPulse: e.target.value })}
                      className="input-control py-1.5 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#777789] mb-1">Temp (°F)</label>
                    <input
                      type="text"
                      placeholder="e.g. 98.6"
                      value={formData.vitalTemp}
                      onChange={(e) => setFormData({ ...formData, vitalTemp: e.target.value })}
                      className="input-control py-1.5 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#777789] mb-1">SpO2 (%)</label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      placeholder="e.g. 99"
                      value={formData.vitalSpo2}
                      onChange={(e) => setFormData({ ...formData, vitalSpo2: e.target.value })}
                      className="input-control py-1.5 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#777789] mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 70.5"
                      value={formData.vitalWeight}
                      onChange={(e) => setFormData({ ...formData, vitalWeight: e.target.value })}
                      className="input-control py-1.5 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Symptoms & Diagnosis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#37318B] uppercase tracking-wider mb-1.5">
                    Chief Symptoms / Complaints *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Patient reports persistent dry cough and mild fever for 3 days..."
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    className="input-control text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#37318B] uppercase tracking-wider mb-1.5">
                    Primary Diagnosis *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Acute viral upper respiratory infection (URI) with tracheitis..."
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="input-control text-xs resize-none"
                  />
                </div>
              </div>

              {/* Clinical Notes & Treatment Plan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#37318B] uppercase tracking-wider mb-1.5">
                    Doctor Clinical Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Chest clear on auscultation, no focal signs, no signs of acute distress..."
                    value={formData.clinicalNotes}
                    onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                    className="input-control text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#37318B] uppercase tracking-wider mb-1.5">
                    Treatment Plan & Regimen
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Adequate hydration, steam inhalation, symptomatic paracetamol if febrile..."
                    value={formData.treatmentPlan}
                    onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
                    className="input-control text-xs resize-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
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
                  disabled={submitting}
                  className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {submitting ? 'Signing Encounter...' : 'Sign & Complete Encounter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENCOUNTER DOSSIER DETAILS MODAL */}
      {showDetailModal && selectedConsultation && (
        <div className="fixed inset-0 bg-[#292743]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-[#E8E6F0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E6F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0EFFF] text-[#37318B] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#8278E8]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#37318B]">Encounter Record #{selectedConsultation.id}</h3>
                  <p className="text-xs text-[#777789]">{formatDate(selectedConsultation.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F0EFFF] flex items-center justify-center text-[#777789] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs text-[#292743]">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F0EFFF]/60 rounded-2xl border border-[#E8E6F0]">
                <div>
                  <span className="text-[#777789] block text-[11px]">Patient:</span>
                  <span className="font-bold text-[#37318B] text-sm">
                    {selectedConsultation.patientName} ({selectedConsultation.patientCode})
                  </span>
                </div>
                <div>
                  <span className="text-[#777789] block text-[11px]">Clinician:</span>
                  <span className="font-bold text-[#37318B] text-sm">
                    Dr. {selectedConsultation.doctorName}
                  </span>
                </div>
              </div>

              {/* Vitals Summary */}
              <div className="p-3.5 bg-[#DFF6FC]/40 rounded-2xl border border-[#DFF6FC]">
                <span className="font-bold text-[#0284C7] block mb-2 uppercase tracking-wider text-[11px]">
                  Clinical Vitals
                </span>
                <div className="grid grid-cols-3 gap-2.5 text-[#292743]">
                  <div>BP: <strong>{selectedConsultation.vitalBp || 'N/A'}</strong></div>
                  <div>Pulse: <strong>{selectedConsultation.vitalPulse ? `${selectedConsultation.vitalPulse} bpm` : 'N/A'}</strong></div>
                  <div>SpO2: <strong>{selectedConsultation.vitalSpo2 ? `${selectedConsultation.vitalSpo2}%` : 'N/A'}</strong></div>
                  <div>Temp: <strong>{selectedConsultation.vitalTemp || 'N/A'}</strong></div>
                  <div>Weight: <strong>{selectedConsultation.vitalWeight ? `${selectedConsultation.vitalWeight} kg` : 'N/A'}</strong></div>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#37318B] block mb-1">Symptoms Description</span>
                <p className="p-3 bg-[#F0EFFF]/40 rounded-xl text-[#292743] border border-[#E8E6F0]">{selectedConsultation.symptoms}</p>
              </div>

              <div>
                <span className="font-bold text-[#37318B] block mb-1">Diagnosis</span>
                <p className="p-3 bg-[#F0EFFF]/40 rounded-xl font-medium text-[#292743] border border-[#E8E6F0]">{selectedConsultation.diagnosis}</p>
              </div>

              {selectedConsultation.clinicalNotes && (
                <div>
                  <span className="font-bold text-[#37318B] block mb-1">Clinical Notes</span>
                  <p className="p-3 bg-[#F0EFFF]/40 rounded-xl text-[#292743] border border-[#E8E6F0]">{selectedConsultation.clinicalNotes}</p>
                </div>
              )}

              {selectedConsultation.treatmentPlan && (
                <div>
                  <span className="font-bold text-[#37318B] block mb-1">Treatment Regimen</span>
                  <p className="p-3 bg-[#F0EFFF]/40 rounded-xl text-[#292743] border border-[#E8E6F0]">{selectedConsultation.treatmentPlan}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E6F0]">
              <button
                onClick={() => setShowDetailModal(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Consultations
