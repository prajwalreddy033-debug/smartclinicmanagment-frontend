import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../store/slices/authSlice'
import { Link, useNavigate } from 'react-router-dom'
import {
  Stethoscope,
  Mail,
  Lock,
  HeartPulse,
  Pill,
  Activity,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileText,
  User,
  Shield,
  CheckCircle2
} from 'lucide-react'

const DoctorLogin = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [formData, setFormData] = useState({
    username: 'dr.smith@smartclinic.com',
    password: 'Admin@123',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(login(formData))
    if (!result.error) {
      navigate('/dashboard')
    }
  }

  const fillDoctorDemo = (email) => {
    setFormData({
      username: email,
      password: 'Admin@123',
    })
  }

  return (
    <div className="min-h-screen bg-[#F0EFFF] flex flex-col justify-between p-3 sm:p-6 lg:p-8">
      {/* Top Navigation */}
      <header className="max-w-6xl w-full mx-auto bg-white rounded-2xl border border-[#E8E6F0] px-5 py-3.5 shadow-sm mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/login" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#37318B] text-white flex items-center justify-center font-bold shadow-sm">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-[#37318B] text-base sm:text-lg tracking-tight">SmartClinic</span>
              <span className="text-[11px] text-[#777789] ml-2 font-medium hidden sm:inline">Physician & Clinical Portal</span>
            </div>
          </Link>
        </div>

        {/* Portal switcher pills */}
        <div className="flex items-center gap-2">
          <Link
            to="/login/admin"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#777789] hover:text-[#37318B] hover:bg-[#F0EFFF] transition"
          >
            <Shield className="w-3.5 h-3.5 text-[#37318B]" />
            Admin Console
          </Link>
          <Link
            to="/login/patient"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#777789] hover:text-[#37318B] hover:bg-[#F0EFFF] transition"
          >
            <User className="w-3.5 h-3.5 text-[#E94E9B]" />
            Patient Portal
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F0EFFF] hover:bg-[#E8E6F0] text-[#37318B] font-bold rounded-xl text-xs transition border border-[#E8E6F0]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Choose Role (Admin / Doctor / Patient)</span>
          </Link>
        </div>
      </header>

      {/* Main Doctor Card */}
      <main className="max-w-6xl w-full mx-auto bg-white rounded-3xl border border-[#E8E6F0] p-6 sm:p-10 lg:p-12 my-auto shadow-sm">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F0] text-[#10B981] text-xs font-bold border border-[#A7F3D0] mb-3">
                <HeartPulse className="w-3.5 h-3.5" />
                Clinical Practice Workstation
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#37318B] tracking-tight">
                Physician & Doctor Login
              </h1>
              <p className="text-sm text-[#777789] mt-1.5">
                Access your consultation encounters, patient medical histories, clinical vitals charting, and e-prescriptions.
              </p>
            </div>

            {/* Quick Demo Fill Bar */}
            <div className="mb-6 p-3.5 bg-[#F0EFFF]/60 rounded-2xl border border-[#E8E6F0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#37318B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E94E9B]" />
                  Select Attending Physician Demo Account
                </span>
                <span className="text-[10px] font-semibold text-[#8278E8] uppercase tracking-wider">One-click</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDoctorDemo('dr.smith@smartclinic.com')}
                  className="p-2.5 bg-white hover:bg-[#F0EFFF] rounded-xl border border-[#E8E6F0] text-left transition group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#37318B] text-white flex items-center justify-center font-bold text-[11px]">
                      RS
                    </div>
                    <div>
                      <p className="font-bold text-[#37318B] text-xs group-hover:text-[#E94E9B] transition">Dr. Robert Smith</p>
                      <p className="text-[10px] text-[#777789]">Cardiologist (MD)</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDoctorDemo('dr.sarah@smartclinic.com')}
                  className="p-2.5 bg-white hover:bg-[#F0EFFF] rounded-xl border border-[#E8E6F0] text-left transition group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#8278E8] text-white flex items-center justify-center font-bold text-[11px]">
                      SJ
                    </div>
                    <div>
                      <p className="font-bold text-[#37318B] text-xs group-hover:text-[#E94E9B] transition">Dr. Sarah Jenkins</p>
                      <p className="text-[10px] text-[#777789]">Pediatrician (MD)</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-[#FDF0F0] border border-[#EF4444]/20 rounded-xl text-xs text-[#EF4444] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{typeof error === 'string' ? error : 'Invalid doctor credentials.'}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                  Doctor Clinical Email or Username *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="dr.smith@smartclinic.com"
                    className="input-control pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#37318B]">
                    Clinical Password *
                  </label>
                  <span className="text-[11px] text-[#777789]">Default: Admin@123</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="input-control pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777789] hover:text-[#37318B]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#777789] pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E94E9B] focus:ring-[#8278E8] border-[#E8E6F0]"
                  />
                  <span>Keep clinician session active</span>
                </label>
                <span className="text-[#10B981] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Prescriptions Signed Digitally
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm font-bold shadow-sm"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Enter Clinical Workstation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#E8E6F0] flex flex-wrap items-center justify-between text-xs text-[#777789] gap-2">
              <span>Looking for other portals?</span>
              <div className="flex gap-3">
                <Link to="/login/admin" className="text-[#37318B] hover:text-[#E94E9B] font-bold">
                  Admin Console →
                </Link>
                <Link to="/login/patient" className="text-[#E94E9B] hover:text-[#D63F89] font-bold">
                  Patient Portal →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Doctor Features & Workflow Highlights */}
          <div className="lg:col-span-5 bg-[#F0EFFF]/50 rounded-2xl p-6 sm:p-8 border border-[#E8E6F0]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8278E8] uppercase tracking-wider mb-2">
              <Activity className="w-4 h-4" />
              <span>Attending Physician Workflow</span>
            </div>
            <h2 className="text-xl font-bold text-[#37318B] tracking-tight">
              Clinical Decision Support & EHR
            </h2>
            <p className="text-xs text-[#777789] mt-1 leading-relaxed">
              Accelerate patient turnaround times with structured differential diagnoses, automatic vitals tracking, and instant medication advice.
            </p>

            <div className="space-y-3 mt-6">
              <div className="p-3.5 bg-white rounded-xl border border-[#E8E6F0] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F0EFFF] text-[#37318B] flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#37318B]">Encounter Documentation</h4>
                  <p className="text-[11px] text-[#777789] mt-0.5">Quickly document chief complaints, physical findings, and structured treatment regimens.</p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#E8E6F0] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#DFF6FC] text-[#0284C7] flex items-center justify-center flex-shrink-0">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#37318B]">Electronic Prescriptions & PDF</h4>
                  <p className="text-[11px] text-[#777789] mt-0.5">Formulate multi-drug dosages with frequencies and dietary instructions; download legal PDFs in 1-click.</p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#E8E6F0] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#37318B]">Longitudinal Patient Dossier</h4>
                  <p className="text-[11px] text-[#777789] mt-0.5">Instantly review chronic diseases, known drug allergies, previous consultation notes, and lab reports.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E8E6F0] flex items-center justify-between text-[11px] text-[#777789]">
              <span className="text-[#37318B] font-semibold">SmartClinic Clinical Suite</span>
              <span className="text-emerald-600 font-medium">Sync Active</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-[#777789] mt-6">
        SmartClinic Healthcare Systems · Multi-Specialty Clinical Center · Physician Gateway
      </footer>
    </div>
  )
}

export default DoctorLogin
