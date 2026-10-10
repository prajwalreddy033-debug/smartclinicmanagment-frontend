import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../store/api'
import { ROLES } from '../utils/constants'
import {
  Search,
  User,
  Stethoscope,
  FileText,
  FlaskConical,
  AlertTriangle,
  Phone,
  Mail,
  HeartPulse,
  Pill,
  Droplet,
  Activity,
  CalendarDays,
  ClipboardList,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import { formatDate } from '../utils/formatters'

const unwrap = (data) => (Array.isArray(data) ? data : data?.content || [])

const MedicalHistory = () => {
  const { user } = useSelector((state) => state.auth)
  const isStaff =
    user?.role === ROLES.DOCTOR || user?.role === ROLES.CLINIC_ADMIN || user?.role === ROLES.RECEPTIONIST || user?.role === ROLES.ADMIN

  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [patient, setPatient] = useState(null)
  const [consultations, setConsultations] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [labReports, setLabReports] = useState([])
  const [loading, setLoading] = useState(false)

  // Staff: load the patient list. Patient: pin to their own record.
  useEffect(() => {
    if (isStaff) {
      api
        .get('/patients', { params: { size: 500 } })
        .then((res) => setPatients(unwrap(res.data?.data)))
        .catch(() => {})
    } else if (user?.patientId) {
      setSelectedPatientId(user.patientId)
    }
  }, [isStaff, user?.patientId])

  // Load full medical history for the selected patient
  useEffect(() => {
    if (!selectedPatientId) {
      setPatient(null)
      setConsultations([])
      setPrescriptions([])
      setLabReports([])
      return
    }
    setLoading(true)
    Promise.all([
      api.get(`/patients/${selectedPatientId}`),
      api.get('/consultations', { params: { patientId: selectedPatientId, size: 500 } }),
      api.get('/prescriptions', { params: { patientId: selectedPatientId, size: 500 } }),
      api.get('/lab-reports', { params: { patientId: selectedPatientId, size: 500 } }),
    ])
      .then(([p, c, pr, lr]) => {
        setPatient(p.data?.data || null)
        setConsultations(unwrap(c.data?.data))
        setPrescriptions(unwrap(pr.data?.data))
        setLabReports(unwrap(lr.data?.data))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedPatientId])

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase()
    return (
      !q ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.patientCode?.toLowerCase().includes(q) ||
      (p.phone || '').includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8E6F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8278E8] uppercase tracking-wider mb-1">
            <span className="w-6 h-6 rounded-lg bg-[#F0EFFF] flex items-center justify-center text-[#37318B]">
              <ClipboardList className="w-3.5 h-3.5" />
            </span>
            <span>Electronic Health Records (EHR)</span>
          </div>
          <h1 className="text-2xl font-bold text-[#37318B] tracking-tight">Patient Medical Dossier</h1>
          <p className="text-sm text-[#777789] mt-0.5">
            {isStaff
              ? 'Select a patient from the roster to inspect consultations, e-prescriptions, and laboratory diagnostics.'
              : 'Your complete clinical encounters, prescriptions, and verified laboratory test reports.'}
          </p>
        </div>
      </div>

      {isStaff ? (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          {/* Patient picker */}
          <div className="smart-card overflow-hidden">
            <div className="p-4 border-b border-[#E8E6F0] bg-[#F0EFFF]/40">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                <input
                  type="text"
                  placeholder="Search patient name, MRN, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-control pl-10 text-xs py-2 bg-white"
                />
              </div>
            </div>
            <div className="max-h-[calc(100vh-270px)] overflow-y-auto divide-y divide-[#E8E6F0]/60">
              {filteredPatients.map((p) => {
                const isSelected = selectedPatientId === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`w-full text-left p-3.5 transition flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[#F0EFFF] border-l-4 border-[#8278E8]'
                        : 'hover:bg-[#F0EFFF]/40 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition ${
                        isSelected ? 'bg-[#37318B] text-white' : 'bg-[#F0EFFF] text-[#8278E8] group-hover:bg-[#E8E6F0]'
                      }`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold text-sm truncate ${isSelected ? 'text-[#37318B]' : 'text-[#292743]'}`}>
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="text-xs text-[#777789] truncate">
                          <span className="font-mono text-[11px]">{p.patientCode}</span> · {p.gender}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition ${isSelected ? 'text-[#8278E8]' : 'text-[#E8E6F0] group-hover:text-[#777789]'}`} />
                  </button>
                )
              })}
              {filteredPatients.length === 0 && (
                <div className="p-8 text-center text-xs text-[#777789]">
                  No patients match criteria.
                </div>
              )}
            </div>
          </div>

          {/* History detail */}
          <HistoryDetail
            patient={patient}
            consultations={consultations}
            prescriptions={prescriptions}
            labReports={labReports}
            loading={loading}
            empty={!selectedPatientId}
          />
        </div>
      ) : (
        <HistoryDetail
          patient={patient}
          consultations={consultations}
          prescriptions={prescriptions}
          labReports={labReports}
          loading={loading}
          empty={false}
        />
      )}
    </div>
  )
}

const HistoryDetail = ({ patient, consultations, prescriptions, labReports, loading, empty }) => {
  if (empty) {
    return (
      <div className="smart-card p-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#F0EFFF] flex items-center justify-center text-[#8278E8] mx-auto mb-3">
          <ClipboardList className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-[#37318B] text-base">Select a patient record</h3>
        <p className="text-xs text-[#777789] mt-1 max-w-sm mx-auto">
          Choose a patient from the left roster to view their clinical encounters, prescriptions, and verified laboratory diagnostics.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="smart-card p-16 text-center text-[#777789]">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-[#8278E8] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-medium text-[#777789]">Compiling medical record dossier...</span>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="smart-card p-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#F0EFFF] flex items-center justify-center text-[#8278E8] mx-auto mb-3">
          <User className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-[#37318B] text-base">No patient record found</h3>
        <p className="text-xs text-[#777789] mt-1">Please select an existing patient.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Patient Profile Card */}
      <div className="smart-card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-[#E8E6F0]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#37318B] rounded-2xl flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-[#37318B]">
                  {patient.firstName} {patient.lastName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium bg-[#F0EFFF] text-[#37318B] border border-[#E8E6F0]">
                  {patient.patientCode}
                </span>
              </div>
              <p className="text-xs text-[#777789] mt-0.5">
                {patient.gender} · Age {patient.age ?? '—'} · Registered {formatDate(patient.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {patient.bloodGroup && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF0F0] text-[#EF4444] border border-[#EF4444]/20">
                <Droplet className="w-3.5 h-3.5" />
                Blood: {patient.bloodGroup}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F0EFFF] text-[#37318B] border border-[#E8E6F0]">
              <CalendarDays className="w-3.5 h-3.5 text-[#8278E8]" />
              DOB: {patient.dateOfBirth || '—'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
          <div className="flex items-center gap-2 text-[#292743]">
            <Phone className="w-4 h-4 text-[#8278E8]" />
            <span>Phone: <strong className="font-semibold text-[#37318B]">{patient.phone || '—'}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-[#292743]">
            <Mail className="w-4 h-4 text-[#8278E8]" />
            <span>Email: <strong className="font-semibold text-[#37318B]">{patient.email || '—'}</strong></span>
          </div>
        </div>

        {(patient.chronicDiseases || patient.allergies) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#E8E6F0]">
            {patient.allergies && (
              <div className="p-3.5 rounded-2xl bg-[#FDF0F0] border border-[#EF4444]/20">
                <p className="text-xs font-bold text-[#EF4444] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Known Allergies
                </p>
                <p className="text-xs text-[#292743] mt-1 font-medium">{patient.allergies}</p>
              </div>
            )}
            {patient.chronicDiseases && (
              <div className="p-3.5 rounded-2xl bg-[#FEF6E7] border border-[#D97706]/20">
                <p className="text-xs font-bold text-[#D97706] uppercase tracking-wider flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4" /> Chronic Conditions
                </p>
                <p className="text-xs text-[#292743] mt-1 font-medium">{patient.chronicDiseases}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Medical history note */}
      {patient.medicalHistory && (
        <div className="smart-card p-6">
          <h3 className="text-base font-bold text-[#37318B] mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#8278E8]" /> Clinical Background & Notes
          </h3>
          <p className="text-xs text-[#292743] leading-relaxed whitespace-pre-line p-3.5 bg-[#F0EFFF]/40 rounded-2xl border border-[#E8E6F0]">
            {patient.medicalHistory}
          </p>
        </div>
      )}

      {/* Past consultations */}
      <div className="smart-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E6F0] mb-4">
          <h3 className="text-base font-bold text-[#37318B] flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#8278E8]" /> Past Consultations ({consultations.length})
          </h3>
        </div>
        <div className="space-y-4">
          {consultations.map((c) => (
            <div key={c.id} className="border border-[#E8E6F0] rounded-2xl p-4.5 bg-white hover:border-[#8278E8]/40 transition">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2 pb-2 border-b border-[#E8E6F0]/60">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#37318B] text-sm">Dr. {c.doctorName || 'Attending Physician'}</span>
                  {c.specialization && (
                    <span className="text-[#37318B] bg-[#F0EFFF] px-2 py-0.5 rounded-md text-[11px] font-medium border border-[#E8E6F0]">
                      {c.specialization}
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#777789] font-medium">{formatDate(c.createdAt)}</span>
              </div>
              {c.diagnosis && (
                <p className="text-xs text-[#292743] mb-1.5">
                  <span className="font-bold text-[#37318B]">Diagnosis:</span> {c.diagnosis}
                </p>
              )}
              {c.symptoms && (
                <p className="text-xs text-[#777789] mb-2">
                  <span className="font-semibold text-[#292743]">Reported Symptoms:</span> {c.symptoms}
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-xs">
                {c.vitalBp && <span className="px-2.5 py-1 bg-[#F0EFFF] text-[#37318B] font-medium rounded-lg border border-[#E8E6F0]">BP: {c.vitalBp}</span>}
                {c.vitalPulse && <span className="px-2.5 py-1 bg-[#F0EFFF] text-[#37318B] font-medium rounded-lg border border-[#E8E6F0]">Pulse: {c.vitalPulse} bpm</span>}
                {c.vitalTemp && <span className="px-2.5 py-1 bg-[#F0EFFF] text-[#37318B] font-medium rounded-lg border border-[#E8E6F0]">Temp: {c.vitalTemp}</span>}
                {c.vitalWeight && <span className="px-2.5 py-1 bg-[#F0EFFF] text-[#37318B] font-medium rounded-lg border border-[#E8E6F0]">Weight: {c.vitalWeight} kg</span>}
                {c.vitalSpo2 && <span className="px-2.5 py-1 bg-[#F0EFFF] text-[#37318B] font-medium rounded-lg border border-[#E8E6F0]">SpO2: {c.vitalSpo2}%</span>}
              </div>
              {c.treatmentPlan && (
                <p className="text-xs text-[#292743] mt-3 border-t border-[#E8E6F0] pt-2">
                  <span className="font-bold text-[#37318B]">Prescribed Plan:</span> {c.treatmentPlan}
                </p>
              )}
            </div>
          ))}
          {consultations.length === 0 && (
            <p className="text-xs text-[#777789] text-center py-6">No consultation records logged.</p>
          )}
        </div>
      </div>

      {/* Prescriptions */}
      <div className="smart-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E6F0] mb-4">
          <h3 className="text-base font-bold text-[#37318B] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#8278E8]" /> Prescriptions ({prescriptions.length})
          </h3>
        </div>
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="border border-[#E8E6F0] rounded-2xl p-4.5 bg-white hover:border-[#8278E8]/40 transition">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3 pb-2 border-b border-[#E8E6F0]/60">
                <p className="font-bold text-[#37318B] text-sm">{rx.prescriptionNumber}</p>
                <span className="text-xs text-[#777789]">
                  Dr. {rx.doctorName} · {formatDate(rx.createdAt)}
                </span>
              </div>
              <div className="space-y-2">
                {(rx.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-[#292743] p-2 bg-[#F0EFFF]/30 rounded-xl border border-[#E8E6F0]">
                    <span className="w-2 h-2 rounded-full bg-[#E94E9B] flex-shrink-0"></span>
                    <span className="font-bold text-[#37318B]">{item.medicineName}</span>
                    <span className="font-mono text-[#777789]">{item.dosage}</span>
                    <span className="text-[#37318B] bg-[#F0EFFF] px-2 py-0.5 rounded text-[11px] font-medium">{item.frequency}</span>
                    <span className="text-[#777789]">{item.duration}</span>
                  </div>
                ))}
              </div>
              {rx.generalAdvice && (
                <p className="text-xs text-[#292743] mt-3 border-t border-[#E8E6F0] pt-2">
                  <span className="font-bold text-[#37318B]">Clinical Advice:</span> {rx.generalAdvice}
                </p>
              )}
              {rx.nextVisitDate && (
                <p className="text-xs text-[#8278E8] mt-1 font-semibold">
                  Follow-up Review: {formatDate(rx.nextVisitDate)}
                </p>
              )}
            </div>
          ))}
          {prescriptions.length === 0 && (
            <p className="text-xs text-[#777789] text-center py-6">No electronic prescriptions on file.</p>
          )}
        </div>
      </div>

      {/* Lab reports */}
      <div className="smart-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E6F0] mb-4">
          <h3 className="text-base font-bold text-[#37318B] flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#8278E8]" /> Laboratory Diagnostics ({labReports.length})
          </h3>
        </div>
        <div className="space-y-4">
          {labReports.map((lr) => (
            <div key={lr.id} className="border border-[#E8E6F0] rounded-2xl p-4.5 bg-white hover:border-[#8278E8]/40 transition">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2 pb-2 border-b border-[#E8E6F0]/60">
                <p className="font-bold text-[#37318B] text-sm">
                  {lr.testName} <span className="text-xs text-[#777789] font-normal font-mono">({lr.reportNumber})</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#777789]">{formatDate(lr.resultDate || lr.createdAt)}</span>
                  <span
                    className={`badge ${
                      lr.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'
                    }`}
                  >
                    {lr.status || 'PENDING'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#777789] mb-2 font-medium">
                {lr.testCategory} · Requested by Dr. {lr.doctorName}
              </p>
              {lr.testResults && (
                <pre className="text-xs text-[#292743] bg-[#F0EFFF]/40 rounded-xl p-3 border border-[#E8E6F0] overflow-x-auto whitespace-pre-wrap font-mono">
                  {lr.testResults}
                </pre>
              )}
              {lr.notes && (
                <p className="text-xs text-[#777789] mt-2 italic">Notes: {lr.notes}</p>
              )}
            </div>
          ))}
          {labReports.length === 0 && (
            <p className="text-xs text-[#777789] text-center py-6">No laboratory test reports on file.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MedicalHistory