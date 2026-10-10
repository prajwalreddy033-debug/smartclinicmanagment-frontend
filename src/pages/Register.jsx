import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { register } from '../store/slices/authSlice'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  Phone,
  Stethoscope,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2
} from 'lucide-react'

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
  })
  const [localError, setLocalError] = useState('')

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      username: formData.username.trim(),
      phone: formData.phone.trim() || undefined,
      password: formData.password,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth || undefined,
    }

    const result = await dispatch(register(payload))
    if (!result.error) {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-[#F0EFFF] flex flex-col justify-between p-3 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto bg-white rounded-2xl border border-[#E8E6F0] px-5 py-3.5 shadow-soft mb-6 flex items-center justify-between">
        <Link to="/login" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EEEBFF] text-[#37318B] border border-[#D5D1FF] flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5 text-[#37318B]" />
          </div>
          <div>
            <span className="font-bold text-[#37318B] text-base tracking-tight">SmartClinic</span>
            <span className="text-[11px] text-[#777789] ml-2 font-medium hidden sm:inline">Patient Registration</span>
          </div>
        </Link>

        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#37318B] hover:bg-[#F0EFFF] border border-[#E8E6F0] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* Main Registration Card */}
      <main className="max-w-6xl w-full mx-auto bg-white rounded-2xl sm:rounded-3xl border border-[#E8E6F0] shadow-card p-6 sm:p-10 my-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEEBFF] text-[#37318B] text-xs font-bold border border-[#D5D1FF] mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#E94E9B]" />
                Self-Service Patient Portal
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#37318B] tracking-tight">
                Create Patient Account
              </h2>
              <p className="text-sm text-[#777789] mt-1.5 font-normal">
                Register to book doctor appointments, track clinical consultations and download electronic prescriptions.
              </p>
            </div>

            {(localError || error) && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#FDF0F0] border border-rose-200 text-[#EF4444] text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{localError || (typeof error === 'string' ? error : 'Registration failed')}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.fullName}
                      onChange={handleChange('fullName')}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E8E6F0] rounded-xl text-[#292743] placeholder-[#777789]/60 focus:outline-none focus:border-[#8278E8] focus:ring-2 focus:ring-[#8278E8]/15 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                    <input
                      type="text"
                      required
                      placeholder="janedoe"
                      value={formData.username}
                      onChange={handleChange('username')}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E8E6F0] rounded-xl text-[#292743] placeholder-[#777789]/60 focus:outline-none focus:border-[#8278E8] focus:ring-2 focus:ring-[#8278E8]/15 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                    <input
                      type="email"
                      required
                      placeholder="jane.doe@example.com"
                      value={formData.email}
                      onChange={handleChange('email')}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E8E6F0] rounded-xl text-[#292743] placeholder-[#777789]/60 focus:outline-none focus:border-[#8278E8] focus:ring-2 focus:ring-[#8278E8]/15 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E8E6F0] rounded-xl text-[#292743] placeholder-[#777789]/60 focus:outline-none focus:border-[#8278E8] focus:ring-2 focus:ring-[#8278E8]/15 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={handleChange('gender')}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E8E6F0] rounded-xl text-[#292743] focus:outline-none focus:border-[#8278E8] focus:ring-2 focus:ring-[#8278E8]/15 transition"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange('dateOfBirth')}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E8E6F0] rounded-xl text-[#292743] focus:outline-none focus:border-[#8278E8] focus:ring-2 focus:ring-[#8278E8]/15 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange('password')}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E8E6F0] rounded-xl text-[#292743] placeholder-[#777789]/60 focus:outline-none focus:border-[#8278E8] focus:ring-2 focus:ring-[#8278E8]/15 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E8E6F0] rounded-xl text-[#292743] placeholder-[#777789]/60 focus:outline-none focus:border-[#8278E8] focus:ring-2 focus:ring-[#8278E8]/15 transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-[#E94E9B] hover:bg-[#D63F89] text-white font-bold rounded-xl text-sm transition duration-150 shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Create Patient Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-[#777789]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#E94E9B] hover:text-[#D63F89] font-bold">
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Benefits Card */}
          <div className="lg:col-span-5 bg-[#FBFBFF] rounded-2xl p-6 sm:p-8 border border-[#E8E6F0] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EEEBFF] border border-[#D5D1FF] flex items-center justify-center text-[#37318B] shadow-sm mb-6">
                <ShieldCheck className="w-6 h-6 text-[#E94E9B]" />
              </div>

              <h3 className="text-xl font-bold text-[#37318B] leading-snug">
                Your Health Records In One Secure Place
              </h3>
              <p className="text-xs text-[#777789] mt-2 leading-relaxed">
                Connect directly with certified practitioners, schedule consultations with instant queue estimates, and download official medical prescriptions.
              </p>

              <div className="mt-6 space-y-3.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E8E6F0] shadow-sm">
                  <div className="w-7 h-7 rounded-lg bg-[#E8F8F0] text-[#10B981] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#37318B]">Instant Appointment Confirmation</h4>
                    <p className="text-[11px] text-[#777789]">Select your preferred doctor and live time-slot.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E8E6F0] shadow-sm">
                  <div className="w-7 h-7 rounded-lg bg-[#DFF6FC] text-[#0284C7] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#37318B]">Direct Prescription Access</h4>
                    <p className="text-[11px] text-[#777789]">Download digitally signed prescriptions as official PDFs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E8E6F0] shadow-sm">
                  <div className="w-7 h-7 rounded-lg bg-[#EEEBFF] text-[#8278E8] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#37318B]">Billing & Invoices</h4>
                    <p className="text-[11px] text-[#777789]">Clear itemized statements with zero hidden charges.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E8E6F0] flex items-center justify-between text-[11px] text-[#777789]">
              <span className="flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-[#8278E8]" />
                Metro Health Clinic
              </span>
              <span className="font-semibold text-[#37318B]">SmartClinic Patient Network</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-4 text-xs text-[#777789]">
        © 2026 SmartClinic System. All patient health records protected under clinical privacy standards.
      </footer>
    </div>
  )
}

export default Register