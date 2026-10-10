import { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { fetchPrescriptions, createPrescription, downloadPrescriptionPdf } from '../store/slices/prescriptionSlice'
import { fetchConsultations } from '../store/slices/consultationSlice'
import {
  Download,
  Plus,
  Pill,
  X,
  Save,
  Stethoscope,
  Search,
  Calendar,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  Trash2,
  AlertCircle,
  User,
  ShieldCheck
} from 'lucide-react'
import { formatDate } from '../utils/formatters'

const emptyMedicine = () => ({
  medicineName: '',
  dosage: '',
  frequency: 'Once daily (After food)',
  duration: '5 days',
  instructions: '',
})

const COMMON_FREQUENCIES = [
  'Once daily (Morning)',
  'Once daily (Night)',
  'Twice daily (Morning & Night)',
  'Thrice daily (TDS - After food)',
  'As needed (SOS / For pain)',
]

const Prescriptions = () => {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()

  const { prescriptions, loading, error } = useSelector((state) => state.prescriptions)
  const { consultations } = useSelector((state) => state.consultations)
  const { user } = useSelector((state) => state.auth)

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [form, setForm] = useState({
    consultationId: '',
    generalAdvice: '',
    dietInstructions: '',
    nextVisitDate: '',
    items: [emptyMedicine()],
  })

  // Consultations available for writing prescription
  const doctorConsultations = useMemo(
    () => consultations.filter((c) => !c.hasPrescription),
    [consultations]
  )

  useEffect(() => {
    dispatch(fetchPrescriptions())
    if (user?.role === 'DOCTOR' || user?.role === 'CLINIC_ADMIN' || user?.role === 'ADMIN') {
      dispatch(fetchConsultations())
    }
  }, [dispatch, user?.role])

  // If routed from Consultations with ?consultationId=...
  useEffect(() => {
    const cId = searchParams.get('consultationId')
    if (cId) {
      setForm((prev) => ({ ...prev, consultationId: cId }))
      if (user?.role === 'DOCTOR' || user?.role === 'CLINIC_ADMIN' || user?.role === 'ADMIN') {
        setOpen(true)
      }
    }
  }, [searchParams, user?.role])

  const updateItem = (index, field, value) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))

  const addMedicine = () => setForm((f) => ({ ...f, items: [...f.items, emptyMedicine()] }))
  const removeMedicine = (index) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const result = await dispatch(
      createPrescription({
        consultationId: Number(form.consultationId),
        generalAdvice: form.generalAdvice,
        dietInstructions: form.dietInstructions,
        nextVisitDate: form.nextVisitDate || null,
        items: form.items,
      })
    )
    setSaving(false)
    if (!result.error) {
      setOpen(false)
      setForm({
        consultationId: '',
        generalAdvice: '',
        dietInstructions: '',
        nextVisitDate: '',
        items: [emptyMedicine()],
      })
      dispatch(fetchConsultations())
    }
  }

  // Filtered list
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        (p.prescriptionNumber && p.prescriptionNumber.toLowerCase().includes(searchLower)) ||
        (p.patientName && p.patientName.toLowerCase().includes(searchLower)) ||
        (p.doctorName && p.doctorName.toLowerCase().includes(searchLower)) ||
        (p.items && p.items.some((i) => i.medicineName?.toLowerCase().includes(searchLower)))
      return matchesSearch
    })
  }, [prescriptions, searchTerm])

  const canCreate = user?.role === 'DOCTOR' || user?.role === 'CLINIC_ADMIN' || user?.role === 'ADMIN'
  const totalCount = prescriptions.length
  const totalMedicines = prescriptions.reduce((sum, p) => sum + (p.items?.length || 0), 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8E6F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8278E8] uppercase tracking-wider mb-1">
            <span className="w-6 h-6 rounded-lg bg-[#F0EFFF] flex items-center justify-center text-[#37318B]">
              <Pill className="w-3.5 h-3.5" />
            </span>
            <span>Digital Pharmacy & Rx</span>
          </div>
          <h1 className="text-2xl font-bold text-[#37318B] tracking-tight">E-Prescriptions Directory</h1>
          <p className="text-sm text-[#777789] mt-0.5">
            Generate digital prescriptions, medication dosage regimens, and clinical advice with instant PDF exports.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setOpen(true)}
            className="btn-primary inline-flex items-center justify-center gap-2 shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Issue Prescription
          </button>
        )}
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="smart-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#777789]">Total Prescriptions</p>
            <p className="text-2xl font-bold text-[#37318B] mt-1">{totalCount}</p>
            <p className="text-[11px] text-[#777789] mt-0.5">Authorised e-scripts</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F0EFFF] flex items-center justify-center text-[#37318B]">
            <Pill className="w-5 h-5 text-[#8278E8]" />
          </div>
        </div>

        <div className="smart-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#777789]">Medicines Dispensed</p>
            <p className="text-2xl font-bold text-[#8278E8] mt-1">{totalMedicines}</p>
            <p className="text-[11px] text-[#777789] mt-0.5">Line items prescribed</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#DFF6FC] flex items-center justify-center text-[#0284C7]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="smart-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#777789]">Awaiting Rx</p>
            <p className="text-2xl font-bold text-[#D97706] mt-1">{doctorConsultations.length}</p>
            <p className="text-[11px] text-[#777789] mt-0.5">Consultations completed</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FEF6E7] flex items-center justify-center text-[#D97706]">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-[#FDF0F0] border border-[#EF4444]/20 rounded-2xl text-xs text-[#EF4444] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="smart-card p-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
          <input
            type="text"
            placeholder="Search by Rx #, patient name, doctor, drug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-control pl-10"
          />
        </div>
      </div>

      {/* Prescriptions Feed */}
      {loading ? (
        <div className="smart-card p-16 text-center text-[#777789]">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-3 border-[#8278E8] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium text-[#777789]">Loading electronic prescriptions...</span>
          </div>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="smart-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F0EFFF] flex items-center justify-center text-[#8278E8] mx-auto mb-3">
            <Pill className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-[#37318B] text-base">No prescriptions found</h3>
          <p className="text-xs text-[#777789] mt-1 max-w-sm mx-auto">
            {canCreate
              ? 'Click "Issue Prescription" to formulate medication regimens for your consultations.'
              : 'Prescriptions will be listed here after being issued by attending physicians.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredPrescriptions.map((p) => (
            <div
              key={p.id}
              className="smart-card p-5 hover:border-[#8278E8]/40 transition duration-200"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#E8E6F0]">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0EFFF] text-[#37318B] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Pill className="w-6 h-6 text-[#8278E8]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[#37318B] text-base">{p.prescriptionNumber}</h3>
                      <span className="text-xs text-[#777789]">•</span>
                      <span className="text-xs text-[#777789] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(p.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[#777789] mt-1">
                      Patient: <strong className="text-[#37318B]">{p.patientName}</strong> • Attending: Dr.{' '}
                      <strong className="text-[#292743]">{p.doctorName}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => dispatch(downloadPrescriptionPdf(p.id))}
                  className="btn-secondary inline-flex items-center gap-1.5 text-xs py-2 px-3.5 shadow-sm text-[#37318B] hover:border-[#8278E8]"
                >
                  <Download className="w-3.5 h-3.5 text-[#8278E8]" />
                  Download PDF
                </button>
              </div>

              {/* Medication Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E8E6F0] text-[#777789] uppercase tracking-wider font-semibold text-[11px]">
                      <th className="py-2.5 px-3">Medicine Name</th>
                      <th className="py-2.5 px-3">Dosage</th>
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E6F0]/60 text-[#292743]">
                    {p.items?.map((m, idx) => (
                      <tr key={m.id || idx} className="hover:bg-[#F0EFFF]/30 transition">
                        <td className="py-3 px-3 font-semibold text-[#37318B] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#E94E9B]"></span>
                          {m.medicineName}
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-xs">{m.dosage}</td>
                        <td className="py-3 px-3">
                          <span className="text-[#37318B] bg-[#F0EFFF] px-2 py-0.5 rounded-md text-[11px] font-medium border border-[#E8E6F0]">
                            {m.frequency}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium">{m.duration}</td>
                        <td className="py-3 px-3 text-[#777789] italic">{m.instructions || 'As advised'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Advice & Next Visit */}
              {(p.generalAdvice || p.dietInstructions || p.nextVisitDate) && (
                <div className="mt-4 pt-3 border-t border-[#E8E6F0] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#292743]">
                  {p.generalAdvice && (
                    <div className="p-3 bg-[#F0EFFF]/50 rounded-xl border border-[#E8E6F0]">
                      <strong className="text-[#37318B] block mb-1 font-semibold">Clinical Advice:</strong>
                      <span className="text-[#777789]">{p.generalAdvice}</span>
                    </div>
                  )}
                  {p.dietInstructions && (
                    <div className="p-3 bg-[#F0EFFF]/50 rounded-xl border border-[#E8E6F0]">
                      <strong className="text-[#37318B] block mb-1 font-semibold">Dietary Regimen:</strong>
                      <span className="text-[#777789]">{p.dietInstructions}</span>
                    </div>
                  )}
                  {p.nextVisitDate && (
                    <div className="md:col-span-2 text-xs text-[#8278E8] flex items-center gap-1.5 font-semibold bg-[#F0EFFF]/80 p-2.5 rounded-xl border border-[#E8E6F0]">
                      <Calendar className="w-4 h-4 text-[#37318B]" />
                      <span>Recommended Follow-up Visit: <strong className="text-[#37318B]">{formatDate(p.nextVisitDate)}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ISSUE PRESCRIPTION MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 bg-[#292743]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl border border-[#E8E6F0] p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E6F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0EFFF] text-[#37318B] flex items-center justify-center">
                  <Pill className="w-5 h-5 text-[#8278E8]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#37318B]">Formulate Digital E-Prescription</h2>
                  <p className="text-xs text-[#777789]">Attach medicine regimens to completed consultation encounters.</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F0EFFF] flex items-center justify-center text-[#777789] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-5 pt-4">
              <div>
                <label className="block text-xs font-semibold text-[#37318B] uppercase tracking-wider mb-1.5">
                  Select Completed Consultation Encounter *
                </label>
                <select
                  required
                  value={form.consultationId}
                  onChange={(e) => setForm({ ...form, consultationId: e.target.value })}
                  className="input-control"
                >
                  <option value="">Select consultation...</option>
                  {doctorConsultations.map((c) => (
                    <option key={c.id} value={c.id}>
                      Encounter #{c.id} — {c.patientName} ({c.patientCode}) • Diagnosis: {c.diagnosis || 'Clinical visit'}
                    </option>
                  ))}
                </select>
                {doctorConsultations.length === 0 && (
                  <p className="text-xs text-[#D97706] mt-1">
                    No open consultations pending prescription. Complete a consultation first.
                  </p>
                )}
              </div>

              {/* Medicines Form */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#37318B]">
                    Prescribed Medicines ({form.items.length})
                  </span>
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="text-xs font-semibold text-[#E94E9B] hover:text-[#D63F89] flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Another Drug
                  </button>
                </div>

                {form.items.map((item, i) => (
                  <div key={i} className="p-4 border border-[#E8E6F0] rounded-2xl bg-[#F0EFFF]/40 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#37318B]">Medicine #{i + 1}</span>
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicine(i)}
                          className="text-[#EF4444] hover:text-red-700 text-xs flex items-center gap-1 font-medium transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-[#777789] mb-1">Drug Name *</label>
                        <input
                          required
                          value={item.medicineName}
                          onChange={(e) => updateItem(i, 'medicineName', e.target.value)}
                          placeholder="e.g. Amoxicillin"
                          className="input-control py-1.5 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#777789] mb-1">Dosage *</label>
                        <input
                          required
                          value={item.dosage}
                          onChange={(e) => updateItem(i, 'dosage', e.target.value)}
                          placeholder="e.g. 500 mg"
                          className="input-control py-1.5 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#777789] mb-1">Frequency *</label>
                        <select
                          required
                          value={item.frequency}
                          onChange={(e) => updateItem(i, 'frequency', e.target.value)}
                          className="input-control py-1.5 text-xs bg-white"
                        >
                          {COMMON_FREQUENCIES.map((freq) => (
                            <option key={freq} value={freq}>
                              {freq}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#777789] mb-1">Duration *</label>
                        <input
                          required
                          value={item.duration}
                          onChange={(e) => updateItem(i, 'duration', e.target.value)}
                          placeholder="e.g. 5 days"
                          className="input-control py-1.5 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        value={item.instructions}
                        onChange={(e) => updateItem(i, 'instructions', e.target.value)}
                        placeholder="Additional instruction e.g. Take immediately after food with plenty of water"
                        className="input-control py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Clinical Advice & Diet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#37318B] uppercase tracking-wider mb-1.5">
                    General Clinical Advice
                  </label>
                  <textarea
                    rows={3}
                    value={form.generalAdvice}
                    onChange={(e) => setForm({ ...form, generalAdvice: e.target.value })}
                    placeholder="Adequate hydration, bed rest for 48 hours..."
                    className="input-control text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#37318B] uppercase tracking-wider mb-1.5">
                    Dietary Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={form.dietInstructions}
                    onChange={(e) => setForm({ ...form, dietInstructions: e.target.value })}
                    placeholder="Low sodium, avoid spicy/greasy food..."
                    className="input-control text-xs resize-none"
                  />
                </div>
              </div>

              {/* Next Visit Date */}
              <div>
                <label className="block text-xs font-semibold text-[#37318B] uppercase tracking-wider mb-1.5">
                  Follow-up Review Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.nextVisitDate}
                  onChange={(e) => setForm({ ...form, nextVisitDate: e.target.value })}
                  className="input-control w-auto text-xs"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E6F0]">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !doctorConsultations.length}
                  className="btn-primary inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Issuing Prescription...' : 'Authorize & Sign Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Prescriptions
