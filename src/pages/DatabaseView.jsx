import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchAppointments } from '../store/slices/appointmentSlice'
import { fetchPatients } from '../store/slices/patientSlice'
import { fetchDoctors } from '../store/slices/doctorSlice'
import { fetchBills } from '../store/slices/billingSlice'
import { fetchNotifications } from '../store/slices/notificationSlice'
import {
  Database,
  Users,
  UserCheck,
  Stethoscope,
  Calendar,
  FileText,
  DollarSign,
  FlaskConical,
  Bell,
  RefreshCw,
  Download,
  Sparkles,
  Layers,
  ShieldCheck
} from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/formatters'

const DatabaseView = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { appointments } = useSelector((state) => state.appointments)
  const { patients } = useSelector((state) => state.patients)
  const { doctors } = useSelector((state) => state.doctors)
  const { bills } = useSelector((state) => state.billing)
  const { notifications } = useSelector((state) => state.notifications)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        dispatch(fetchAppointments({ size: 1000 })),
        dispatch(fetchPatients({ size: 1000 })),
        dispatch(fetchDoctors()),
        dispatch(fetchBills({ size: 1000 })),
        dispatch(fetchNotifications()),
      ])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    const data = {
      users: user ? [user] : [],
      doctors,
      patients,
      appointments,
      bills,
      notifications,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'smartclinic-database-export.json'
    a.click()
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Database },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'patients', label: 'Patients', icon: UserCheck },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'bills', label: 'Bills', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Doctors" value={doctors.length} icon={Stethoscope} />
        <StatCard title="Patients" value={patients.length} icon={UserCheck} />
        <StatCard title="Appointments" value={appointments.length} icon={Calendar} />
        <StatCard title="Bills" value={bills.length} icon={DollarSign} />
        <StatCard title="Notifications" value={notifications.length} icon={Bell} />
      </div>

      <div className="smart-card p-6">
        <h3 className="text-base font-bold text-[#37318B] mb-4">Database Records Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-[#F0EFFF]/50 rounded-2xl border border-[#E8E6F0]">
            <h4 className="text-xs font-bold text-[#37318B] uppercase tracking-wider mb-3">Appointment Status</h4>
            <div className="space-y-2.5">
              {['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
                <div key={status} className="flex justify-between items-center text-xs">
                  <span className="text-[#777789] font-medium">{status}</span>
                  <span className="font-bold text-[#37318B] bg-white px-2.5 py-0.5 rounded-lg border border-[#E8E6F0]">
                    {appointments.filter((a) => a.status === status).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-[#F0EFFF]/50 rounded-2xl border border-[#E8E6F0]">
            <h4 className="text-xs font-bold text-[#37318B] uppercase tracking-wider mb-3">Payment Status</h4>
            <div className="space-y-2.5">
              {['UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED'].map((status) => (
                <div key={status} className="flex justify-between items-center text-xs">
                  <span className="text-[#777789] font-medium">{status.replace('_', ' ')}</span>
                  <span className="font-bold text-[#37318B] bg-white px-2.5 py-0.5 rounded-lg border border-[#E8E6F0]">
                    {bills.filter((b) => b.paymentStatus === status).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDoctors = () => (
    <div className="smart-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#F0EFFF]/50 border-b border-[#E8E6F0] text-xs font-semibold text-[#777789] uppercase tracking-wider">
              <th className="px-5 py-3.5">Code</th>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Specialization</th>
              <th className="px-5 py-3.5">Fee</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E6F0]/60">
            {doctors.map((doc) => (
              <tr key={doc.id} className="hover:bg-[#F0EFFF]/30 transition">
                <td className="px-5 py-3.5 font-mono text-xs text-[#8278E8] font-bold">{doc.doctorCode}</td>
                <td className="px-5 py-3.5 font-bold text-[#37318B]">{doc.fullName}</td>
                <td className="px-5 py-3.5 text-xs text-[#777789]">{doc.email}</td>
                <td className="px-5 py-3.5 text-xs">
                  <span className="bg-[#F0EFFF] text-[#37318B] px-2 py-0.5 rounded-md font-medium border border-[#E8E6F0]">
                    {doc.specialization}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs font-bold text-[#292743]">${doc.consultationFee}</td>
                <td className="px-5 py-3.5">
                  <span className={`badge ${
                    doc.status === 'ACTIVE' ? 'badge-completed' : 'badge-cancelled'
                  }`}>
                    {doc.status}
                  </span>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-xs text-[#777789]">No doctors found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderPatients = () => (
    <div className="smart-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#F0EFFF]/50 border-b border-[#E8E6F0] text-xs font-semibold text-[#777789] uppercase tracking-wider">
              <th className="px-5 py-3.5">Code</th>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Phone</th>
              <th className="px-5 py-3.5">Gender</th>
              <th className="px-5 py-3.5">DOB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E6F0]/60">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-[#F0EFFF]/30 transition">
                <td className="px-5 py-3.5 font-mono text-xs text-[#8278E8] font-bold">{patient.patientCode}</td>
                <td className="px-5 py-3.5 font-bold text-[#37318B]">
                  {patient.firstName} {patient.lastName}
                </td>
                <td className="px-5 py-3.5 text-xs text-[#777789]">{patient.email}</td>
                <td className="px-5 py-3.5 text-xs text-[#292743] font-medium">{patient.phone}</td>
                <td className="px-5 py-3.5 text-xs text-[#777789]">{patient.gender}</td>
                <td className="px-5 py-3.5 text-xs text-[#777789]">{patient.dateOfBirth}</td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-xs text-[#777789]">No patients found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderAppointments = () => (
    <div className="smart-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#F0EFFF]/50 border-b border-[#E8E6F0] text-xs font-semibold text-[#777789] uppercase tracking-wider">
              <th className="px-5 py-3.5">Number</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Time</th>
              <th className="px-5 py-3.5">Patient</th>
              <th className="px-5 py-3.5">Doctor</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E6F0]/60">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-[#F0EFFF]/30 transition">
                <td className="px-5 py-3.5 font-mono text-xs text-[#8278E8] font-bold">#{apt.appointmentNumber}</td>
                <td className="px-5 py-3.5 text-xs text-[#292743]">{apt.appointmentDate}</td>
                <td className="px-5 py-3.5 text-xs text-[#777789]">{apt.timeSlot}</td>
                <td className="px-5 py-3.5 text-xs font-semibold text-[#37318B]">{apt.patientName || '—'}</td>
                <td className="px-5 py-3.5 text-xs text-[#292743]">Dr. {apt.doctorName || '—'}</td>
                <td className="px-5 py-3.5">
                  <span className={`badge ${
                    apt.status === 'COMPLETED' ? 'badge-completed' :
                    apt.status === 'CANCELLED' ? 'badge-cancelled' :
                    'badge-scheduled'
                  }`}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-xs text-[#777789]">No appointments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderBills = () => (
    <div className="smart-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#F0EFFF]/50 border-b border-[#E8E6F0] text-xs font-semibold text-[#777789] uppercase tracking-wider">
              <th className="px-5 py-3.5">Invoice</th>
              <th className="px-5 py-3.5">Patient</th>
              <th className="px-5 py-3.5">Total</th>
              <th className="px-5 py-3.5">Paid</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E6F0]/60">
            {bills.map((bill) => (
              <tr key={bill.id} className="hover:bg-[#F0EFFF]/30 transition">
                <td className="px-5 py-3.5 font-mono text-xs text-[#8278E8] font-bold">{bill.invoiceNumber}</td>
                <td className="px-5 py-3.5 text-xs font-semibold text-[#37318B]">{bill.patientName || '—'}</td>
                <td className="px-5 py-3.5 text-xs font-bold text-[#292743]">{formatCurrency(bill.totalAmount || bill.netAmount)}</td>
                <td className="px-5 py-3.5 text-xs font-semibold text-emerald-600">{formatCurrency(bill.paidAmount || 0)}</td>
                <td className="px-5 py-3.5">
                  <span className={`badge ${
                    bill.paymentStatus === 'PAID' ? 'badge-completed' :
                    bill.paymentStatus === 'UNPAID' ? 'badge-cancelled' :
                    'badge-pending'
                  }`}>
                    {bill.paymentStatus}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-[#777789]">{bill.paymentDate || formatDate(bill.createdAt)}</td>
              </tr>
            ))}
            {bills.length === 0 && (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-xs text-[#777789]">No bills found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="smart-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#F0EFFF]/50 border-b border-[#E8E6F0] text-xs font-semibold text-[#777789] uppercase tracking-wider">
              <th className="px-5 py-3.5">Title</th>
              <th className="px-5 py-3.5">Message</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E6F0]/60">
            {notifications.map((notif) => (
              <tr key={notif.id} className="hover:bg-[#F0EFFF]/30 transition">
                <td className="px-5 py-3.5 font-bold text-[#37318B] text-xs">{notif.title}</td>
                <td className="px-5 py-3.5 text-xs text-[#777789] max-w-xs truncate">{notif.message}</td>
                <td className="px-5 py-3.5 text-xs">
                  <span className="bg-[#F0EFFF] text-[#37318B] px-2 py-0.5 rounded-md font-medium border border-[#E8E6F0]">
                    {notif.type}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`badge ${
                    notif.isRead ? 'badge-completed' : 'badge-pending'
                  }`}>
                    {notif.isRead ? 'Read' : 'Unread'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-[#777789]">{formatDate(notif.createdAt)}</td>
              </tr>
            ))}
            {notifications.length === 0 && (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-xs text-[#777789]">No notifications found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview()
      case 'doctors': return renderDoctors()
      case 'patients': return renderPatients()
      case 'appointments': return renderAppointments()
      case 'bills': return renderBills()
      case 'notifications': return renderNotifications()
      default: return renderOverview()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8E6F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8278E8] uppercase tracking-wider mb-1">
            <span className="w-6 h-6 rounded-lg bg-[#F0EFFF] flex items-center justify-center text-[#37318B]">
              <Database className="w-3.5 h-3.5" />
            </span>
            <span>System Administration</span>
          </div>
          <h1 className="text-2xl font-bold text-[#37318B] tracking-tight">Database Ledger & Explorer</h1>
          <p className="text-sm text-[#777789] mt-0.5">View all persistent database tables, relational records, and export system snapshots.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-secondary inline-flex items-center gap-2 text-xs py-2 px-3.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportData}
            className="btn-primary inline-flex items-center gap-2 text-xs py-2 px-4 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      <div className="smart-card p-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#37318B] text-white shadow-sm'
                    : 'text-[#777789] hover:bg-[#F0EFFF] hover:text-[#37318B]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="smart-card p-16 text-center text-[#777789]">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-3 border-[#8278E8] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium text-[#777789]">Querying database records...</span>
          </div>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  )
}

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="smart-card p-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-[#777789] mb-0.5">{title}</p>
        <p className="text-2xl font-bold text-[#37318B]">{value}</p>
      </div>
      <div className="w-11 h-11 rounded-2xl bg-[#F0EFFF] flex items-center justify-center text-[#8278E8]">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
}

export default DatabaseView
