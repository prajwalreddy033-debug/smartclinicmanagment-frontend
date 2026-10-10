import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchAppointments } from '../store/slices/appointmentSlice'
import { fetchPatients } from '../store/slices/patientSlice'
import { fetchDoctors } from '../store/slices/doctorSlice'
import { fetchBills } from '../store/slices/billingSlice'
import { fetchNotifications } from '../store/slices/notificationSlice'
import { ROLES } from '../utils/constants'
import {
  Calendar,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Sparkles,
  ArrowRight,
  Shield,
  FileText,
  AlertCircle,
  UserCheck
} from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { appointments, loading: apptsLoading } = useSelector((state) => state.appointments)
  const { patients, loading: patientsLoading } = useSelector((state) => state.patients)
  const { doctors, loading: doctorsLoading } = useSelector((state) => state.doctors)
  const { bills, loading: billsLoading } = useSelector((state) => state.billing)

  useEffect(() => {
    dispatch(fetchAppointments({ size: 500 }))
    dispatch(fetchPatients({ size: 500 }))
    dispatch(fetchDoctors())
    dispatch(fetchBills({ size: 500 }))
    dispatch(fetchNotifications())
  }, [dispatch])

  const role = user?.role
  const todayStr = new Date().toISOString().slice(0, 10)
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  // Role-scoped data
  const myAppointments = useMemo(() => {
    if (role === ROLES.DOCTOR) return appointments.filter((a) => a.doctorId === user?.doctorId)
    if (role === ROLES.PATIENT) return appointments.filter((a) => a.patientId === user?.patientId)
    return appointments
  }, [appointments, role, user?.doctorId, user?.patientId])

  const myBills = useMemo(() => {
    if (role === ROLES.PATIENT) return bills.filter((b) => b.patientId === user?.patientId)
    return bills
  }, [bills, role, user?.patientId])

  // Global metrics (admin / receptionist)
  const totalAppointments = appointments.length
  const totalPatients = patients.length
  const totalDoctors = doctors.length
  const totalRevenue = bills.reduce((sum, bill) => sum + (Number(bill.paidAmount) || 0), 0)
  const pendingBills = bills.filter((b) => b.paymentStatus === 'UNPAID' || b.paymentStatus === 'PARTIALLY_PAID').length
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED').length
  const scheduledAppointments = appointments.filter((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length
  const cancelledAppointments = appointments.filter((a) => a.status === 'CANCELLED').length

  // Doctor & Patient metrics
  const myUpcoming = myAppointments.filter((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
  const myCompleted = myAppointments.filter((a) => a.status === 'COMPLETED')
  const myCancelled = myAppointments.filter((a) => a.status === 'CANCELLED')
  const myPendingBills = myBills.filter((b) => b.paymentStatus === 'UNPAID')
  const myPaidAmount = myBills.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0)
  const patientsSeen = new Set(myAppointments.filter((a) => a.patientId).map((a) => a.patientId)).size
  const todaysAppointments = myAppointments.filter((a) => String(a.appointmentDate) === todayStr)

  // Doctor attendance calculations
  const doctorAttendance = useMemo(() => {
    return doctors
      .map((doc) => {
        const docAppts = appointments.filter((a) => a.doctorId === doc.id)
        const attended = docAppts.filter((a) => a.status === 'COMPLETED').length
        const pending = docAppts.filter((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length
        const cancelled = docAppts.filter((a) => a.status === 'CANCELLED').length
        return {
          id: doc.id,
          name: doc.fullName,
          specialization: doc.specialization,
          code: doc.doctorCode,
          total: docAppts.length,
          attended,
          pending,
          cancelled,
          rate: docAppts.length ? Math.round((attended / docAppts.length) * 100) : 0,
        }
      })
      .sort((a, b) => b.attended - a.attended)
  }, [doctors, appointments])

  // Chart datasets styled with the specified palette
  const appointmentDoughnutData = {
    labels: ['Completed', 'Scheduled', 'Cancelled'],
    datasets: [
      {
        data: [completedAppointments, scheduledAppointments, cancelledAppointments],
        backgroundColor: ['#10B981', '#8278E8', '#EF4444'],
        hoverBackgroundColor: ['#059669', '#6C61DB', '#DC2626'],
        borderWidth: 0,
      },
    ],
  }

  const attendedChartData = {
    labels: doctorAttendance.map((d) => d.name),
    datasets: [
      {
        label: 'Patients Attended',
        data: doctorAttendance.map((d) => d.attended),
        backgroundColor: '#8278E8',
        borderRadius: 8,
      },
    ],
  }

  const revenueLineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [14000, 21000, 18500, 29000, 24500, Math.max(32000, totalRevenue)],
        borderColor: '#E94E9B',
        backgroundColor: 'rgba(233, 78, 155, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#E94E9B',
        pointRadius: 4,
      },
    ],
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge-completed">Completed</span>
      case 'CANCELLED':
        return <span className="badge-cancelled">Cancelled</span>
      case 'PENDING':
        return <span className="badge-pending">Pending</span>
      default:
        return <span className="badge-scheduled">Scheduled</span>
    }
  }

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* 4 Key Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={totalPatients}
          subtitle="Registered in clinic database"
          icon={Users}
          theme="purple"
        />
        <StatCard
          title="Active Doctors"
          value={totalDoctors}
          subtitle="Specialists on active roster"
          icon={Stethoscope}
          theme="pink"
        />
        <StatCard
          title="Appointments"
          value={totalAppointments}
          subtitle={`${scheduledAppointments} upcoming schedule`}
          icon={Calendar}
          theme="blue"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          subtitle={`${pendingBills} pending invoice(s)`}
          icon={DollarSign}
          theme="green"
        />
      </div>

      {/* Doctor Performance & Attendance Table */}
      <div className="smart-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-base font-bold text-[#37318B]">Patients Attended Per Doctor</h3>
            <p className="text-xs text-[#777789] mt-0.5">Consultation metrics and completed appointments by physician</p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-[#E8F8F0] text-[#10B981] border border-[#A7F3D0]">
            {doctorAttendance.reduce((s, d) => s + d.attended, 0)} Total Consultations Completed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-header-cell rounded-l-xl">Doctor</th>
                <th className="table-header-cell">Specialization</th>
                <th className="table-header-cell text-center">Attended</th>
                <th className="table-header-cell text-center">Pending</th>
                <th className="table-header-cell text-center">Cancelled</th>
                <th className="table-header-cell text-center">Total</th>
                <th className="table-header-cell rounded-r-xl w-44">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {doctorAttendance.map((doc) => (
                <tr key={doc.id} className="table-body-row">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-[#292743]">{doc.name}</div>
                    <div className="text-[11px] text-[#777789]">{doc.code}</div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#777789]">{doc.specialization}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-[#10B981]">{doc.attended}</td>
                  <td className="px-4 py-3.5 text-center font-semibold text-[#8278E8]">{doc.pending}</td>
                  <td className="px-4 py-3.5 text-center text-xs text-[#EF4444]">{doc.cancelled}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-[#37318B]">{doc.total}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-2 bg-[#F0EFFF] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#8278E8] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(doc.rate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#37318B] w-9 text-right">{doc.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {doctorAttendance.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-xs text-[#777789]">
                    No doctor profiles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="smart-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#37318B] mb-1">Appointment Breakdown</h3>
            <p className="text-xs text-[#777789] mb-4">Ratio of completed vs scheduled vs cancelled visits</p>
          </div>
          <div className="max-w-[220px] mx-auto py-2">
            <Doughnut
              data={appointmentDoughnutData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                },
              }}
            />
          </div>
        </div>

        <div className="smart-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#37318B] mb-1">Clinic Revenue Stream</h3>
            <p className="text-xs text-[#777789] mb-4">6-month billing trend and collection velocity</p>
          </div>
          <div>
            <Line
              data={revenueLineData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: '#F0EFFF' }, ticks: { font: { size: 10 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                },
              }}
            />
          </div>
        </div>

        <div className="smart-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#37318B] mb-1">Patients Per Physician</h3>
            <p className="text-xs text-[#777789] mb-4">Completed medical encounters across doctors</p>
          </div>
          <div>
            <Bar
              data={attendedChartData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: '#F0EFFF' }, ticks: { font: { size: 10 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Appointments Feed */}
      <div className="smart-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#37318B]">Recent Appointments</h3>
            <p className="text-xs text-[#777789]">Latest booked and handled patient consultations</p>
          </div>
          <span className="text-xs text-[#8278E8] font-bold">Live Stream</span>
        </div>
        <div className="space-y-2.5">
          {appointments.slice(0, 5).map((apt) => (
            <div
              key={apt.id}
              className="flex items-center justify-between p-3.5 bg-[#FBFBFF] hover:bg-[#F0EFFF]/40 rounded-xl border border-[#E8E6F0] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EEEBFF] text-[#37318B] flex items-center justify-center font-bold text-xs">
                  <Calendar className="w-4 h-4 text-[#8278E8]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#292743]">
                    {apt.patientName || `Patient #${apt.patientId || '—'}`} • #{apt.appointmentNumber}
                  </p>
                  <p className="text-[11px] text-[#777789]">
                    {apt.appointmentDate} • {apt.timeSlot || 'Standard slot'} • Dr. {apt.doctorName || 'Assigned Physician'}
                  </p>
                </div>
              </div>
              <div>{getStatusBadge(apt.status)}</div>
            </div>
          ))}
          {appointments.length === 0 && (
            <div className="text-center py-6 text-xs text-[#777789]">No appointments booked yet.</div>
          )}
        </div>
      </div>
    </div>
  )

  const renderDoctorDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Schedule"
          value={todaysAppointments.length}
          subtitle="Patient visits booked for today"
          icon={Calendar}
          theme="purple"
        />
        <StatCard
          title="Completed Visits"
          value={myCompleted.length}
          subtitle="Total attended consultations"
          icon={CheckCircle2}
          theme="green"
        />
        <StatCard
          title="Patients Seen"
          value={patientsSeen}
          subtitle="Unique patients in care"
          icon={Users}
          theme="blue"
        />
        <StatCard
          title="Upcoming In Queue"
          value={myUpcoming.length}
          subtitle="Awaiting clinical encounter"
          icon={Clock}
          theme="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="smart-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#37318B]">Upcoming Scheduled Consultations</h3>
            <span className="badge-scheduled">{myUpcoming.length} queued</span>
          </div>
          <div className="space-y-3">
            {myUpcoming.slice(0, 6).map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-3.5 bg-[#FBFBFF] rounded-xl border border-[#E8E6F0] hover:bg-[#F0EFFF]/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#EEEBFF] rounded-xl flex items-center justify-center text-[#37318B]">
                    <Clock className="w-4 h-4 text-[#8278E8]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#292743]">
                      {apt.patientName || `Patient #${apt.patientId}`}
                    </p>
                    <p className="text-[11px] text-[#777789]">
                      {apt.appointmentDate} • {apt.timeSlot}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="badge-purple">Token #{apt.tokenNumber || '1'}</span>
                </div>
              </div>
            ))}
            {myUpcoming.length === 0 && (
              <p className="text-xs text-[#777789] text-center py-8">No upcoming patients in queue for today.</p>
            )}
          </div>
        </div>

        <div className="smart-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#37318B]">Recent Completed Consultations</h3>
            <span className="badge-completed">{myCompleted.length} finished</span>
          </div>
          <div className="space-y-3">
            {myCompleted.slice(0, 6).map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-3.5 bg-[#FBFBFF] rounded-xl border border-[#E8E6F0]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#E8F8F0] rounded-xl flex items-center justify-center text-[#10B981]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#292743]">{apt.patientName || `Patient #${apt.patientId}`}</p>
                    <p className="text-[11px] text-[#777789]">{apt.appointmentDate} • #{apt.appointmentNumber}</p>
                  </div>
                </div>
                <span className="text-xs text-[#777789] truncate max-w-[130px]">
                  {apt.reasonForVisit || 'Routine checkup'}
                </span>
              </div>
            ))}
            {myCompleted.length === 0 && (
              <p className="text-xs text-[#777789] text-center py-8">No completed consultation history yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderReceptionistDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Appointments"
          value={scheduledAppointments}
          subtitle="Check-ins scheduled today"
          icon={Calendar}
          theme="purple"
        />
        <StatCard
          title="Total Patients"
          value={totalPatients}
          subtitle="Active clinic records"
          icon={Users}
          theme="blue"
        />
        <StatCard
          title="Pending Invoices"
          value={pendingBills}
          subtitle="Awaiting counter settlement"
          icon={DollarSign}
          theme="pink"
        />
        <StatCard
          title="Collected Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          subtitle="Settled ledger balance"
          icon={TrendingUp}
          theme="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="smart-card p-6">
          <h3 className="text-sm font-bold text-[#37318B] mb-4">Today's Appointment Schedule</h3>
          <div className="space-y-2.5">
            {myAppointments.slice(0, 6).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 bg-[#FBFBFF] rounded-xl border border-[#E8E6F0]">
                <div>
                  <p className="text-xs font-bold text-[#292743]">{apt.patientName || `Patient #${apt.patientId}`}</p>
                  <p className="text-[11px] text-[#777789]">{apt.appointmentDate} • Dr. {apt.doctorName || 'Assigned'}</p>
                </div>
                {getStatusBadge(apt.status)}
              </div>
            ))}
          </div>
        </div>

        <div className="smart-card p-6">
          <h3 className="text-sm font-bold text-[#37318B] mb-4">Recently Registered Patients</h3>
          <div className="space-y-2.5">
            {patients.slice(0, 6).map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-3 bg-[#FBFBFF] rounded-xl border border-[#E8E6F0]">
                <div>
                  <p className="text-xs font-bold text-[#292743]">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-[11px] text-[#777789]">{patient.patientCode} • {patient.gender}</p>
                </div>
                <span className="text-xs font-medium text-[#777789]">{patient.phone || 'No phone'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderPatientDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Upcoming Visits"
          value={myUpcoming.length}
          subtitle="Active booked appointments"
          icon={Calendar}
          theme="purple"
        />
        <StatCard
          title="Past Visits"
          value={myCompleted.length}
          subtitle="Completed medical encounters"
          icon={CheckCircle2}
          theme="green"
        />
        <StatCard
          title="Pending Invoices"
          value={myPendingBills.length}
          subtitle="Outstanding clinic bills"
          icon={DollarSign}
          theme="pink"
        />
        <StatCard
          title="Paid Total"
          value={`₹${myPaidAmount.toLocaleString()}`}
          subtitle="Settled health charges"
          icon={TrendingUp}
          theme="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="smart-card p-6">
          <h3 className="text-sm font-bold text-[#37318B] mb-4">My Booked Appointments</h3>
          <div className="space-y-3">
            {myUpcoming.slice(0, 5).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3.5 bg-[#FBFBFF] rounded-xl border border-[#E8E6F0]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#EEEBFF] rounded-xl flex items-center justify-center text-[#8278E8]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#292743]">Dr. {apt.doctorName || 'Doctor'}</p>
                    <p className="text-[11px] text-[#777789]">{apt.appointmentDate} • {apt.timeSlot}</p>
                  </div>
                </div>
                <span className="badge-purple">Token #{apt.tokenNumber || '1'}</span>
              </div>
            ))}
            {myUpcoming.length === 0 && (
              <p className="text-xs text-[#777789] text-center py-8">No upcoming appointments booked.</p>
            )}
          </div>
        </div>

        <div className="smart-card p-6">
          <h3 className="text-sm font-bold text-[#37318B] mb-4">My Consultation History</h3>
          <div className="space-y-3">
            {myCompleted.slice(0, 5).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3.5 bg-[#FBFBFF] rounded-xl border border-[#E8E6F0]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#E8F8F0] rounded-xl flex items-center justify-center text-[#10B981]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#292743]">Dr. {apt.doctorName}</p>
                    <p className="text-[11px] text-[#777789]">{apt.appointmentDate} • #{apt.appointmentNumber}</p>
                  </div>
                </div>
                <span className="text-xs text-[#777789] truncate max-w-[140px]">{apt.reasonForVisit}</span>
              </div>
            ))}
            {myCompleted.length === 0 && (
              <p className="text-xs text-[#777789] text-center py-8">No past visit history recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const getDashboard = () => {
    switch (role) {
      case ROLES.CLINIC_ADMIN:
        return renderAdminDashboard()
      case ROLES.DOCTOR:
        return renderDoctorDashboard()
      case ROLES.RECEPTIONIST:
        return renderReceptionistDashboard()
      case ROLES.PATIENT:
        return renderPatientDashboard()
      default:
        return renderAdminDashboard()
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E6F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#37318B] tracking-tight">
              Welcome back, {user?.fullName || 'Doctor'}
            </h1>
            <span className="badge-purple capitalize">
              {role?.replace('_', ' ').toLowerCase()}
            </span>
          </div>
          <p className="text-xs text-[#777789] mt-1 font-medium">
            Clinical operations overview for <span className="text-[#37318B] font-semibold">{user?.clinicName || 'Metro Health Clinic'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#FBFBFF] border border-[#E8E6F0] rounded-xl px-3.5 py-2 text-xs text-[#777789] shadow-soft">
          <Calendar className="w-4 h-4 text-[#8278E8]" />
          <span className="font-semibold text-[#37318B]">{currentDateFormatted}</span>
        </div>
      </div>

      {/* Main Role-Specific View */}
      {getDashboard()}
    </div>
  )
}

const StatCard = ({ title, value, subtitle, icon: Icon, theme = 'purple' }) => {
  const themeStyles = {
    purple: {
      bg: 'bg-[#EEEBFF]',
      border: 'border-[#D5D1FF]',
      icon: 'text-[#37318B]',
    },
    pink: {
      bg: 'bg-[#FDF2F8]',
      border: 'border-[#FCE7F3]',
      icon: 'text-[#E94E9B]',
    },
    blue: {
      bg: 'bg-[#DFF6FC]',
      border: 'border-[#BAE6FD]',
      icon: 'text-[#0284C7]',
    },
    green: {
      bg: 'bg-[#E8F8F0]',
      border: 'border-[#A7F3D0]',
      icon: 'text-[#10B981]',
    },
  }

  const currentTheme = themeStyles[theme] || themeStyles.purple

  return (
    <div className="smart-card p-5 hover:border-[#8278E8]/40 transition duration-150">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#777789] uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-extrabold text-[#37318B] mt-1 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-[11px] text-[#777789] mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${currentTheme.bg} ${currentTheme.border} ${currentTheme.icon} shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

export default Dashboard