import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../store/slices/authSlice'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield,
  Mail,
  Lock,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Users,
  BarChart3,
  Stethoscope,
  User,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'

const AdminLogin = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [formData, setFormData] = useState({
    username: 'admin.metro@smartclinic.com',
    password: 'Admin@123',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(login(formData))
    if (!result.error) {
      navigate('/dashboard')
    }
  }

  const fillAdminDemo = (email) => {
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
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-[#37318B] text-base sm:text-lg tracking-tight">SmartClinic</span>
              <span className="text-[11px] text-[#777789] ml-2 font-medium hidden sm:inline">Admin & Operations</span>
            </div>
          </Link>
        </div>

        {/* Portal switcher pills */}
        <div className="flex items-center gap-2">
          <Link
            to="/login/doctor"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#777789] hover:text-[#37318B] hover:bg-[#F0EFFF] transition"
          >
            <Stethoscope className="w-3.5 h-3.5 text-[#8278E8]" />
            Doctor Portal
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

      {/* Main Admin Card */}
      <main className="max-w-6xl w-full mx-auto bg-white rounded-3xl border border-[#E8E6F0] p-6 sm:p-10 lg:p-12 my-auto shadow-sm">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFF6FC] text-[#0284C7] text-xs font-bold border border-[#BAE6FD] mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                Executive Administration Console
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#37318B] tracking-tight">
                Clinic Administrator Login
              </h1>
              <p className="text-sm text-[#777789] mt-1.5">
                Manage clinic operations, staff scheduling, revenue reconciliation, and system configurations.
              </p>
            </div>

            {/* Quick Demo Fill Bar */}
            <div className="mb-6 p-3.5 bg-[#F0EFFF]/60 rounded-2xl border border-[#E8E6F0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#37318B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E94E9B]" />
                  Quick Fill Admin Demo Account
                </span>
                <span className="text-[10px] font-semibold text-[#8278E8] uppercase tracking-wider">Ready to click</span>
              </div>
              <button
                type="button"
                onClick={() => fillAdminDemo('admin.metro@smartclinic.com')}
                className="w-full p-2.5 bg-white hover:bg-[#F0EFFF] rounded-xl border border-[#E8E6F0] flex items-center justify-between text-xs transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#37318B] text-white flex items-center justify-center font-bold text-[11px]">
                    EV
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#37318B] group-hover:text-[#E94E9B] transition">Eleanor Vance</p>
                    <p className="text-[11px] text-[#777789]">Clinic General Manager</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#8278E8]">admin.metro@smartclinic.com</span>
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-[#FDF0F0] border border-[#EF4444]/20 rounded-xl text-xs text-[#EF4444] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{typeof error === 'string' ? error : 'Invalid admin credentials.'}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#37318B] mb-1.5">
                  Administrator Username or Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="admin.metro@smartclinic.com"
                    className="input-control pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#37318B]">
                    Security Password *
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
                  <span>Keep workstation logged in</span>
                </label>
                <span className="text-[#8278E8] font-medium">Session Security Active</span>
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
                    <span>Authenticate & Access Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#E8E6F0] flex flex-wrap items-center justify-between text-xs text-[#777789] gap-2">
              <span>Switching department?</span>
              <div className="flex gap-3">
                <Link to="/login/doctor" className="text-[#8278E8] hover:text-[#37318B] font-bold">
                  Doctor Login →
                </Link>
                <Link to="/login/patient" className="text-[#E94E9B] hover:text-[#D63F89] font-bold">
                  Patient Portal →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Admin Operations Highlights */}
          <div className="lg:col-span-5 bg-[#F0EFFF]/50 rounded-2xl p-6 sm:p-8 border border-[#E8E6F0]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8278E8] uppercase tracking-wider mb-2">
              <Building2 className="w-4 h-4" />
              <span>Operations & Governance</span>
            </div>
            <h2 className="text-xl font-bold text-[#37318B] tracking-tight">
              Enterprise Small Clinic Suite
            </h2>
            <p className="text-xs text-[#777789] mt-1 leading-relaxed">
              Full visibility over clinic performance, doctor availability rosters, appointment throughput, and real-time revenue collection.
            </p>

            <div className="space-y-3 mt-6">
              <div className="p-3.5 bg-white rounded-xl border border-[#E8E6F0] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F0EFFF] text-[#37318B] flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#37318B]">Physician & Staff Roster</h4>
                  <p className="text-[11px] text-[#777789] mt-0.5">Manage doctor profiles, room allocations, consultation fees, and schedule limits.</p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#E8E6F0] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#37318B]">Financial Reconciliation</h4>
                  <p className="text-[11px] text-[#777789] mt-0.5">Track co-pays, unsettled invoices, and counter cash receipts with automated balance calculations.</p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#E8E6F0] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#DFF6FC] text-[#0284C7] flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#37318B]">HIPAA & Role Access Control</h4>
                  <p className="text-[11px] text-[#777789] mt-0.5">Role-based JWT enforcement ensures medical records are accessible strictly by authorized clinicians.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E8E6F0] flex items-center justify-between text-[11px] text-[#777789]">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Database Online (MySQL 8)
              </span>
              <span>Port: 8070</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-[#777789] mt-6">
        SmartClinic Healthcare Systems · Multi-Specialty Clinical Center · Secure Admin Gateway
      </footer>
    </div>
  )
}

export default AdminLogin
