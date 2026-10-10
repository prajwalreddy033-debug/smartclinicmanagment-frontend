import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield,
  Stethoscope,
  Heart,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  FileText,
  Users,
  Activity,
  CreditCard,
  Lock,
  Building2,
  UserCheck
} from 'lucide-react'

const ROLES_DATA = [
  {
    id: 'admin',
    name: 'Clinic Administrator',
    badge: 'Executive & Staff',
    path: '/login/admin',
    color: '#37318B',
    accentBg: '#F0EFFF',
    borderColor: '#37318B',
    hoverBorder: 'hover:border-[#37318B]',
    selectedRing: 'ring-4 ring-[#37318B]/15 border-[#37318B] bg-[#F0EFFF]/30',
    icon: Shield,
    iconBg: 'bg-[#37318B] text-white',
    badgeStyle: 'bg-[#DFF6FC] text-[#0284C7] border-[#BAE6FD]',
    tagline: 'System operations, staff management, and executive billing oversight.',
    features: [
      'Manage physician rosters & staff profiles',
      'Oversee clinical billing, invoices & cashier POS',
      'Database health, audit trail & administrative control'
    ],
    buttonText: 'Continue to Admin Login',
    buttonClass: 'bg-[#37318B] hover:bg-[#292743] text-white'
  },
  {
    id: 'doctor',
    name: 'Doctor / Physician',
    badge: 'Clinical Care',
    path: '/login/doctor',
    color: '#10B981',
    accentBg: '#E8F8F0',
    borderColor: '#10B981',
    hoverBorder: 'hover:border-[#10B981]',
    selectedRing: 'ring-4 ring-[#10B981]/15 border-[#10B981] bg-[#E8F8F0]/30',
    icon: Stethoscope,
    iconBg: 'bg-[#10B981] text-white',
    badgeStyle: 'bg-[#E8F8F0] text-[#10B981] border-[#A7F3D0]',
    tagline: 'Patient encounters, clinical diagnosis, and electronic prescriptions.',
    features: [
      'Real-time outpatient consultation queue',
      'Record patient vitals, diagnosis & clinical notes',
      'Generate & authorize digital Rx prescriptions'
    ],
    buttonText: 'Continue to Doctor Login',
    buttonClass: 'bg-[#10B981] hover:bg-[#059669] text-white'
  },
  {
    id: 'patient',
    name: 'Patient',
    badge: 'Health Portal',
    path: '/login/patient',
    color: '#E94E9B',
    accentBg: '#FDF2F8',
    borderColor: '#E94E9B',
    hoverBorder: 'hover:border-[#E94E9B]',
    selectedRing: 'ring-4 ring-[#E94E9B]/15 border-[#E94E9B] bg-[#FDF2F8]/30',
    icon: Heart,
    iconBg: 'bg-[#E94E9B] text-white',
    badgeStyle: 'bg-[#FDF2F8] text-[#E94E9B] border-[#FCE7F3]',
    tagline: 'Appointment scheduling, live token tracking, and medical history.',
    features: [
      'Schedule doctor appointments & choose time slots',
      'Live queue waiting times & token monitor',
      'Download medical summaries & payment receipts'
    ],
    buttonText: 'Continue to Patient Login',
    buttonClass: 'bg-[#E94E9B] hover:bg-[#D63F89] text-white'
  }
]

const Login = () => {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('doctor')

  const handleProceed = (path) => {
    navigate(path)
  }

  const activeRoleObj = ROLES_DATA.find((r) => r.id === selectedRole) || ROLES_DATA[0]

  return (
    <div className="min-h-screen bg-[#F0EFFF] flex flex-col justify-between p-3 sm:p-6 lg:p-8">
      {/* Horizontal Navbar */}
      <header className="max-w-6xl w-full mx-auto bg-white rounded-2xl border border-[#E8E6F0] px-5 py-3.5 shadow-sm mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#37318B] text-white flex items-center justify-center font-bold shadow-sm">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-[#37318B] text-base sm:text-lg tracking-tight">SmartClinic</span>
            <span className="text-[11px] text-[#777789] ml-2 font-medium hidden sm:inline">Role-Based Access Gateway</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#DFF6FC] text-[#0284C7] rounded-full text-[11px] font-semibold border border-[#BAE6FD]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse"></span>
            System Online
          </div>
          <Link
            to="/register"
            className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-3.5 shadow-sm"
          >
            <span>Register as Patient</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Role Selector Container */}
      <main className="max-w-5xl w-full mx-auto bg-white rounded-3xl border border-[#E8E6F0] p-6 sm:p-10 lg:p-12 my-auto shadow-sm">
        {/* Gateway Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0EFFF] text-[#37318B] text-xs font-bold border border-[#E8E6F0] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#E94E9B]" />
            Welcome to SmartClinic
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#37318B] tracking-tight">
            Are you an Admin, Doctor, or Patient?
          </h1>
          <p className="text-sm text-[#777789] mt-2.5 leading-relaxed">
            Please choose your role below to be taken to your dedicated login portal.
          </p>
        </div>

        {/* 3 Interactive Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {ROLES_DATA.map((role) => {
            const isSelected = selectedRole === role.id
            const IconComponent = role.icon

            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative p-6 rounded-3xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left ${
                  isSelected
                    ? role.selectedRing
                    : `bg-white border-[#E8E6F0] ${role.hoverBorder} hover:shadow-md`
                }`}
              >
                {/* Active selection badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#37318B] shadow-sm border border-[#E8E6F0]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Selected</span>
                  </div>
                )}

                <div>
                  <div className={`w-14 h-14 rounded-2xl ${role.iconBg} flex items-center justify-center mb-5 shadow-sm`}>
                    <IconComponent className="w-7 h-7" />
                  </div>

                  <div className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-2 ${role.badgeStyle}`}>
                    {role.badge}
                  </div>

                  <h2 className="text-xl font-bold text-[#37318B]">
                    {role.name}
                  </h2>

                  <p className="text-xs text-[#777789] mt-2 leading-relaxed min-h-[36px]">
                    {role.tagline}
                  </p>

                  {/* Feature bullet list */}
                  <ul className="mt-4 pt-4 border-t border-[#E8E6F0] space-y-2 text-xs text-[#292743]">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] text-[#777789]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8278E8] mt-1.5 flex-shrink-0"></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8E6F0]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleProceed(role.path)
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm ${role.buttonClass}`}
                  >
                    <span>{role.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Global Action Banner confirming selection */}
        <div className="p-4 sm:p-5 bg-[#F0EFFF] rounded-2xl border border-[#E8E6F0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className={`w-10 h-10 rounded-xl ${activeRoleObj.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <activeRoleObj.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#37318B]">
                Selected Profile: <span className="text-[#E94E9B]">{activeRoleObj.name}</span>
              </p>
              <p className="text-[11px] text-[#777789]">
                Click below to open the dedicated {activeRoleObj.name} login page.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleProceed(activeRoleObj.path)}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition ${activeRoleObj.buttonClass}`}
          >
            <span>Proceed to {activeRoleObj.name} Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-xs text-[#777789]">
          Are you a new patient without an account?{' '}
          <Link to="/register" className="text-[#E94E9B] hover:text-[#D63F89] font-bold">
            Register for Patient Portal
          </Link>
        </div>
      </main>

      <footer className="max-w-6xl w-full mx-auto text-center py-4 text-xs text-[#777789]">
        SmartClinic Healthcare Systems · Multi-Specialty Clinical Center · Secure Access Gateway
      </footer>
    </div>
  )
}

export default Login
