import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createDoctor } from '../store/slices/doctorSlice'
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  AlertCircle,
  GraduationCap,
  BadgeCheck,
  DollarSign,
  Clock,
  ArrowLeft,
  Sparkles,
  CheckCircle2
} from 'lucide-react'

const SPECIALIZATIONS = [
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'Neurology',
  'ENT',
  'Ophthalmology',
  'Gynecology',
  'Dentistry',
]

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const AddDoctor = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.doctors)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    licenseNumber: '',
    consultationFee: '',
    experienceYears: '',
    availableDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    availableFrom: '09:00',
    availableTo: '17:00',
  })
  const [localError, setLocalError] = useState('')

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  const handleDayToggle = (day) => {
    setFormData({
      ...formData,
      availableDays: formData.availableDays.includes(day)
        ? formData.availableDays.filter((d) => d !== day)
        : [...formData.availableDays, day],
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalError('')

    if (!formData.specialization.trim()) {
      setLocalError('Specialization is required')
      return
    }
    if (!formData.licenseNumber.trim()) {
      setLocalError('License number is required')
      return
    }
    if (!formData.qualification.trim()) {
      setLocalError('Qualification is required')
      return
    }
    if (!formData.consultationFee || parseFloat(formData.consultationFee) <= 0) {
      setLocalError('Valid consultation fee is required')
      return
    }

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      specialization: formData.specialization.trim(),
      qualification: formData.qualification.trim(),
      licenseNumber: formData.licenseNumber.trim(),
      consultationFee: parseFloat(formData.consultationFee),
      experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : 0,
      availableDays: formData.availableDays.join(','),
      availableFrom: formData.availableFrom,
      availableTo: formData.availableTo,
    }

    dispatch(createDoctor(payload))
      .unwrap()
      .then(() => {
        navigate('/dashboard')
      })
      .catch((err) => {
        setLocalError(err || 'Failed to create doctor')
      })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E6F0]">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8278E8] uppercase tracking-wider">
            <Stethoscope className="w-3.5 h-3.5 text-[#E94E9B]" />
            <span>Staff Administration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#37318B] tracking-tight mt-0.5">Provision New Physician</h1>
          <p className="text-xs text-[#777789] font-medium">Add a licensed medical specialist to the clinic roster and scheduling calendar.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary self-start sm:self-auto text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {(error || localError) && (
        <div className="p-3.5 bg-[#FDF0F0] border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-[#EF4444]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error || localError}</span>
        </div>
      )}

      <div className="p-4 bg-[#DFF6FC] border border-[#BAE6FD] rounded-xl text-xs text-[#0284C7] flex items-center gap-2 font-medium">
        <Sparkles className="w-4 h-4 flex-shrink-0 text-[#0284C7]" />
        <span>Staff credentials notice: Initial password will be automatically initialized to <strong>Doctor@123</strong>.</span>
      </div>

      {/* Main Form Card */}
      <div className="smart-card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#37318B] mb-1.5">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
              <input
                type="text"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                className="input-control pl-10"
                placeholder="Dr. Eleanor Vance, MD"
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#37318B] mb-1.5">Doctor Email *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  className="input-control pl-10"
                  placeholder="physician@smartclinic.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#37318B] mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  className="input-control pl-10"
                  placeholder="+1 (555) 012-3456"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#37318B] mb-1.5">Specialization *</label>
            <div className="relative">
              <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
              <select
                value={formData.specialization}
                onChange={handleChange('specialization')}
                className="input-control pl-10"
                required
              >
                <option value="">Select medical specialty...</option>
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#37318B] mb-1.5">Qualification *</label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={handleChange('qualification')}
                  className="input-control pl-10"
                  placeholder="e.g. MBBS, MD (Cardiology)"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#37318B] mb-1.5">License Number *</label>
              <div className="relative">
                <BadgeCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={handleChange('licenseNumber')}
                  className="input-control pl-10"
                  placeholder="e.g. MED-89210-NY"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#37318B] mb-1.5">Consultation Fee (₹) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.consultationFee}
                  onChange={handleChange('consultationFee')}
                  className="input-control pl-10"
                  placeholder="500.00"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#37318B] mb-1.5">Years of Clinical Experience</label>
              <input
                type="number"
                value={formData.experienceYears}
                onChange={handleChange('experienceYears')}
                className="input-control"
                placeholder="8"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#37318B] mb-2">Available Consultation Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const active = formData.availableDays.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      active
                        ? 'bg-[#EEEBFF] text-[#37318B] border-[#8278E8] shadow-sm font-bold'
                        : 'bg-[#FBFBFF] text-[#777789] border-[#E8E6F0] hover:bg-[#F0EFFF]'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#37318B] mb-1.5">Consultation Hours From</label>
              <input
                type="time"
                value={formData.availableFrom}
                onChange={handleChange('availableFrom')}
                className="input-control"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#37318B] mb-1.5">Consultation Hours To</label>
              <input
                type="time"
                value={formData.availableTo}
                onChange={handleChange('availableTo')}
                className="input-control"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E6F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Creating Doctor Account...' : 'Provision Doctor Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDoctor
