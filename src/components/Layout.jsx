import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, login } from '../store/slices/authSlice'
import { fetchNotifications, markAsRead } from '../store/slices/notificationSlice'
import { useState, useEffect, useRef } from 'react'
import api from '../store/api'
import {
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  Users,
  Stethoscope,
  FileText,
  DollarSign,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserPlus,
  Database,
  Building2,
  Check,
  FlaskConical,
  Sparkles
} from 'lucide-react'
import { ROLES, DEMO_CREDENTIALS } from '../utils/constants'
import { formatDate } from '../utils/formatters'

const Layout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { notifications, unreadCount } = useSelector((state) => state.notifications)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false)
  const notifRef = useRef(null)
  const roleRef = useRef(null)

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch, user?.userId])

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationOpen(false)
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setRoleSwitcherOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleQuickSwitch = async (cred) => {
    setRoleSwitcherOpen(false)
    const result = await dispatch(login({ username: cred.email, password: cred.password }))
    if (!result.error) {
      if (result.payload.role === ROLES.PATIENT) {
        navigate('/book')
      } else {
        navigate('/dashboard')
      }
    }
  }

  const handleMarkAllRead = async () => {
    try {
      if (user?.userId) {
        await api.patch(`/notifications/user/${user.userId}/read-all`)
        dispatch(fetchNotifications())
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getNavigation = () => {
    const role = user?.role
    const navItems = []

    navItems.push({
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    })

    navItems.push({
      name: 'Book Appointment',
      path: '/book',
      icon: CalendarPlus,
      badge: null,
    })

    if (role === ROLES.CLINIC_ADMIN) {
      navItems.push(
        { name: 'Appointments', path: '/appointments', icon: Calendar },
        { name: 'Patients', path: '/patients', icon: Users },
        { name: 'Add Doctor', path: '/add-doctor', icon: UserPlus },
        { name: 'Consultations', path: '/consultations', icon: Stethoscope },
        { name: 'Prescriptions', path: '/prescriptions', icon: FileText },
        { name: 'Billing', path: '/billing', icon: DollarSign },
        { name: 'Medical History & Labs', path: '/medical-history', icon: FlaskConical },
        { name: 'Database Explorer', path: '/database', icon: Database, badge: 'Dev' }
      )
    }

    if (role === ROLES.DOCTOR) {
      navItems.push(
        { name: 'Appointments', path: '/appointments', icon: Calendar },
        { name: 'Consultations', path: '/consultations', icon: Stethoscope },
        { name: 'Prescriptions', path: '/prescriptions', icon: FileText },
        { name: 'Medical History & Labs', path: '/medical-history', icon: FlaskConical }
      )
    }

    if (role === ROLES.RECEPTIONIST) {
      navItems.push(
        { name: 'Appointments', path: '/appointments', icon: Calendar },
        { name: 'Patients', path: '/patients', icon: Users },
        { name: 'Billing', path: '/billing', icon: DollarSign },
        { name: 'Medical History & Labs', path: '/medical-history', icon: FlaskConical }
      )
    }

    if (role === ROLES.PATIENT) {
      navItems.push(
        { name: 'My Appointments', path: '/appointments', icon: Calendar },
        { name: 'Prescriptions', path: '/prescriptions', icon: FileText },
        { name: 'Medical History & Labs', path: '/medical-history', icon: FlaskConical },
        { name: 'My Invoices', path: '/billing', icon: DollarSign }
      )
    }

    return navItems
  }

  const navigation = getNavigation()

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case ROLES.CLINIC_ADMIN:
        return 'bg-[#EEEBFF] text-[#37318B] border-[#D5D1FF]'
      case ROLES.DOCTOR:
        return 'bg-[#E8F8F0] text-[#10B981] border-[#A7F3D0]'
      case ROLES.PATIENT:
        return 'bg-[#FDF2F8] text-[#E94E9B] border-[#FCE7F3]'
      default:
        return 'bg-[#FEF6E7] text-[#D97706] border-[#FDE68A]'
    }
  }

  return (
    <div className="min-h-screen bg-[#F0EFFF] p-2 sm:p-4 lg:p-6 flex flex-col justify-center">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#292743]/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Spacious White SaaS Container */}
      <div className="w-full max-w-[1600px] mx-auto bg-white rounded-2xl lg:rounded-3xl border border-[#E8E6F0] shadow-soft flex flex-1 overflow-hidden min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)]">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E8E6F0] flex flex-col flex-shrink-0 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-[#E8E6F0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EEEBFF] text-[#37318B] border border-[#D5D1FF] flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5 text-[#37318B]" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[#37318B] tracking-tight leading-none">
                  SmartClinic
                </h1>
                <p className="text-[11px] text-[#777789] mt-1 font-medium truncate max-w-[130px]">
                  {user?.clinicName || 'Metro Health Clinic'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-[#777789] hover:text-[#37318B] hover:bg-[#F0EFFF] rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto">
            <div className="px-3 py-1.5 text-[11px] uppercase font-bold tracking-wider text-[#777789]/80">
              Workspace
            </div>
            {navigation.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                    isActive
                      ? 'bg-[#EEEBFF] text-[#37318B] font-bold border-l-4 border-[#E94E9B] shadow-sm'
                      : 'text-[#777789] hover:text-[#37318B] hover:bg-[#F0EFFF]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#E94E9B]' : 'text-[#777789]'}`} />
                    <span className="text-[13px]">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DFF6FC] text-[#0284C7] border border-[#BAE6FD]">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* User Account / Footer */}
          <div className="p-3.5 border-t border-[#E8E6F0] bg-[#FBFBFF]">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E8E6F0] shadow-sm mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#EEEBFF] text-[#37318B] font-bold text-xs flex items-center justify-center border border-[#D5D1FF]">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#292743] truncate">{user?.fullName}</p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.2 rounded-full border mt-0.5 ${getRoleBadgeStyle(user?.role)}`}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#777789] hover:text-[#EF4444] hover:bg-[#FDF0F0] rounded-xl transition duration-150"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Top Header Bar */}
          <header className="bg-white border-b border-[#E8E6F0] px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl hover:bg-[#F0EFFF] text-[#37318B] transition"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="hidden sm:flex items-center gap-2.5 text-xs text-[#777789]">
                  <div className="w-6 h-6 rounded-lg bg-[#EEEBFF] flex items-center justify-center text-[#37318B]">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-[#37318B]">{user?.clinicName || 'Metro Health Clinic'}</span>
                  <span className="text-[#E8E6F0]">•</span>
                  <span className="text-[#777789]">Desktop Clinical Workstation</span>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-3">
                {/* Quick Persona Switcher for Live Demo & Review */}
                <div className="relative" ref={roleRef}>
                  <button
                    type="button"
                    onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#FBFBFF] hover:bg-[#F0EFFF] text-[#292743] rounded-xl border border-[#E8E6F0] transition shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E94E9B]" />
                    <span className="text-[#777789] hidden sm:inline">Role:</span>
                    <span className="capitalize font-bold text-[#37318B]">
                      {user?.role?.replace('_', ' ').toLowerCase()}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#777789]" />
                  </button>

                  {roleSwitcherOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-elevated border border-[#E8E6F0] p-2.5 z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="px-3 py-2 border-b border-[#E8E6F0]">
                        <p className="text-xs font-bold text-[#37318B]">Switch Demo Persona</p>
                        <p className="text-[11px] text-[#777789]">Instant access to role-based dashboard views</p>
                      </div>
                      <div className="py-1.5 space-y-1">
                        {DEMO_CREDENTIALS.map((cred) => {
                          const isCurrent = user?.email === cred.email
                          return (
                            <button
                              key={cred.email}
                              onClick={() => handleQuickSwitch(cred)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                                isCurrent
                                  ? 'bg-[#EEEBFF] text-[#37318B] font-bold border border-[#D5D1FF]'
                                  : 'hover:bg-[#F0EFFF]/60 text-[#292743]'
                              }`}
                            >
                              <div>
                                <div className="font-semibold text-[#37318B]">{cred.role}</div>
                                <div className="text-[11px] text-[#777789]">{cred.name}</div>
                              </div>
                              {isCurrent && <Check className="w-4 h-4 text-[#E94E9B]" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative p-2 rounded-xl text-[#777789] hover:text-[#37318B] hover:bg-[#F0EFFF] transition"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E94E9B] rounded-full ring-2 ring-white" />
                    )}
                  </button>

                  {notificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-[#E8E6F0] p-4 z-50">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E8E6F0]">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#8278E8]" />
                          <h3 className="font-bold text-[#37318B] text-xs">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="text-[10px] bg-[#FDF2F8] text-[#E94E9B] font-bold px-2 py-0.5 rounded-full border border-[#FCE7F3]">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-semibold text-[#E94E9B] hover:text-[#D63F89]"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <div className="text-center py-8 text-xs text-[#777789]">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => !n.isRead && dispatch(markAsRead(n.id))}
                              className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                                n.isRead
                                  ? 'bg-[#FBFBFF] border-[#E8E6F0] text-[#777789]'
                                  : 'bg-[#EEEBFF]/50 border-[#D5D1FF] text-[#292743] font-medium'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-[#37318B]">{n.title || 'Alert'}</span>
                                <span className="text-[10px] text-[#777789]">
                                  {formatDate(n.createdAt)}
                                </span>
                              </div>
                              <p className="text-[#777789] leading-relaxed text-[11px]">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Info */}
                <div className="flex items-center gap-3 pl-3 border-l border-[#E8E6F0]">
                  <div className="w-8 h-8 rounded-xl bg-[#EEEBFF] text-[#37318B] font-bold text-xs flex items-center justify-center border border-[#D5D1FF]">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-[#292743] leading-tight">{user?.fullName}</p>
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.2 rounded-full border mt-0.5 ${getRoleBadgeStyle(user?.role)}`}>
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-white">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout
