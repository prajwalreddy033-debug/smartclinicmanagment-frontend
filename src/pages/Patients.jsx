import { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchPatients, createPatient } from '../store/slices/patientSlice'
import {
  Plus,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  AlertCircle,
  Eye,
  CalendarPlus,
  X,
  FileText,
  HeartPulse,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2
} from 'lucide-react'
import { formatDate } from '../utils/formatters'

const Patients = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { patients, loading } = useSelector((state) => state.patients)
  const { user } = useSelector((state) => state.auth)

  const [showModal, setShowModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'MALE',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    bloodGroup: '',
    allergies: '',
    chronicDiseases: '',
    medicalHistory: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  })

  useEffect(() => {
    dispatch(fetchPatients())
  }, [dispatch])

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const searchLower = searchTerm.toLowerCase()
      const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase()
      const code = (patient.patientCode || '').toLowerCase()
      const phone = (patient.phone || '').toLowerCase()
      const email = (patient.email || '').toLowerCase()

      const matchesSearch =
        fullName.includes(searchLower) ||
        code.includes(searchLower) ||
        phone.includes(searchLower) ||
        email.includes(searchLower)

      const matchesGender = genderFilter === 'ALL' || patient.gender === genderFilter

      return matchesSearch && matchesGender
    })
  }, [patients, searchTerm, genderFilter])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await dispatch(createPatient(formData))
    setShowModal(false)
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'MALE',
      dateOfBirth: '',
      phone: '',
      email: '',
      address: '',
      bloodGroup: '',
      allergies: '',
      chronicDiseases: '',
      medicalHistory: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
    })
  }

  const calculateAge = (dob) => {
    if (!dob) return null
    const birthDate = new Date(dob)
    const diff = Date.now() - birthDate.getTime()
    const ageDate = new Date(diff)
    return Math.abs(ageDate.getUTCFullYear() - 1970)
  }

  const canCreatePatient = user?.role === 'RECEPTIONIST' || user?.role === 'CLINIC_ADMIN'

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Patient Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E6F0]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#37318B] tracking-tight">Patient Directory</h1>
          <p className="text-xs text-[#777789] mt-0.5 font-medium">
            Manage patient demographic records, medical profiles, and clinical encounter histories.
          </p>
        </div>
        {canCreatePatient && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="smart-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
          <input
            type="text"
            placeholder="Search patients by name, code, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#E8E6F0] rounded-xl text-[#292743] placeholder-[#777789]/60 focus:outline-none focus:border-[#8278E8] focus:ring-2 focus:ring-[#8278E8]/15 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#777789]" />
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="text-xs bg-[#FBFBFF] border border-[#E8E6F0] rounded-xl px-3 py-2 text-[#37318B] font-semibold focus:outline-none focus:border-[#8278E8]"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex items-center bg-[#FBFBFF] p-1 rounded-xl border border-[#E8E6F0]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'table' ? 'bg-white text-[#37318B] shadow-sm font-bold' : 'text-[#777789]'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'grid' ? 'bg-white text-[#37318B] shadow-sm font-bold' : 'text-[#777789]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Patient Content View */}
      {loading ? (
        <div className="smart-card p-12 text-center text-xs text-[#777789]">
          <div className="inline-block w-6 h-6 border-2 border-[#8278E8] border-t-transparent rounded-full animate-spin mb-2"></div>
          <p>Loading patient records...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="smart-card p-12 text-center text-xs text-[#777789]">
          <User className="w-10 h-10 text-[#D5D1FF] mx-auto mb-2" />
          <p className="font-semibold text-sm text-[#37318B]">No patients found</p>
          <p className="mt-1">Try adjusting your search criteria or register a new patient.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Clean Professional Desktop Table */
        <div className="smart-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-header-cell rounded-l-xl">Patient ID & Name</th>
                  <th className="table-header-cell">Contact</th>
                  <th className="table-header-cell">Gender & Age</th>
                  <th className="table-header-cell">Blood Group & Allergies</th>
                  <th className="table-header-cell">Registration Date</th>
                  <th className="table-header-cell rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => {
                  const age = calculateAge(patient.dateOfBirth)
                  return (
                    <tr key={patient.id} className="table-body-row">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#EEEBFF] text-[#37318B] font-bold text-xs flex items-center justify-center border border-[#D5D1FF]">
                            {patient.firstName?.charAt(0)}
                            {patient.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#292743]">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <span className="text-[11px] font-semibold text-[#8278E8] bg-[#F0EFFF] px-1.5 py-0.2 rounded">
                              {patient.patientCode || `ID-${patient.id}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-xs text-[#292743] font-medium">{patient.phone || '—'}</div>
                        <div className="text-[11px] text-[#777789] truncate max-w-[180px]">{patient.email || 'No email registered'}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-xs font-semibold text-[#37318B] capitalize">{patient.gender?.toLowerCase()}</div>
                        <div className="text-[11px] text-[#777789]">
                          {age ? `${age} yrs (${formatDate(patient.dateOfBirth)})` : formatDate(patient.dateOfBirth)}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {patient.bloodGroup ? (
                            <span className="badge-purple font-bold">{patient.bloodGroup}</span>
                          ) : (
                            <span className="text-[11px] text-[#777789]">—</span>
                          )}
                          {patient.allergies && (
                            <span className="badge-cancelled text-[10px]" title={patient.allergies}>
                              Allergy
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-[#777789]">
                        {formatDate(patient.createdAt || patient.dateOfBirth)}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPatient(patient)}
                            className="p-1.5 hover:bg-[#EEEBFF] text-[#37318B] rounded-lg transition"
                            title="View Patient Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate('/book')}
                            className="p-1.5 hover:bg-[#FDF2F8] text-[#E94E9B] rounded-lg transition"
                            title="Book Appointment"
                          >
                            <CalendarPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => {
            const age = calculateAge(patient.dateOfBirth)
            return (
              <div key={patient.id} className="smart-card p-5 hover:border-[#8278E8]/40 transition duration-150">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#EEEBFF] text-[#37318B] font-bold text-sm flex items-center justify-center border border-[#D5D1FF]">
                      {patient.firstName?.charAt(0)}
                      {patient.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#292743] text-sm">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-[11px] font-semibold text-[#8278E8]">{patient.patientCode || `ID-${patient.id}`}</p>
                    </div>
                  </div>
                  <span className="badge-purple capitalize text-[10px]">{patient.gender?.toLowerCase()}</span>
                </div>

                <div className="space-y-2 text-xs text-[#777789]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#8278E8]" />
                    <span>{age ? `${age} years old` : 'DOB'} ({formatDate(patient.dateOfBirth)})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#8278E8]" />
                    <span>{patient.phone || 'No phone'}</span>
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#8278E8]" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  )}
                  {patient.bloodGroup && (
                    <div className="flex items-center gap-2">
                      <HeartPulse className="w-3.5 h-3.5 text-[#E94E9B]" />
                      <span>Blood Group: <strong className="text-[#37318B]">{patient.bloodGroup}</strong></span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E6F0] flex items-center justify-between">
                  <span className="text-[11px] text-[#777789]">Reg: {formatDate(patient.createdAt)}</span>
                  <button
                    onClick={() => setSelectedPatient(patient)}
                    className="text-xs font-bold text-[#E94E9B] hover:text-[#D63F89] flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-[#292743]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 border border-[#E8E6F0] shadow-modal animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E6F0] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EEEBFF] text-[#37318B] font-bold text-sm flex items-center justify-center border border-[#D5D1FF]">
                  {selectedPatient.firstName?.charAt(0)}
                  {selectedPatient.lastName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#37318B]">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h3>
                  <p className="text-xs text-[#777789]">
                    Patient Code: <span className="font-semibold text-[#8278E8]">{selectedPatient.patientCode}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1 text-[#777789] hover:text-[#37318B] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#FBFBFF] border border-[#E8E6F0]">
                <div>
                  <span className="text-[#777789]">Gender:</span>
                  <p className="font-semibold text-[#292743] capitalize">{selectedPatient.gender?.toLowerCase()}</p>
                </div>
                <div>
                  <span className="text-[#777789]">Date of Birth:</span>
                  <p className="font-semibold text-[#292743]">{formatDate(selectedPatient.dateOfBirth)}</p>
                </div>
                <div>
                  <span className="text-[#777789]">Phone:</span>
                  <p className="font-semibold text-[#292743]">{selectedPatient.phone || '—'}</p>
                </div>
                <div>
                  <span className="text-[#777789]">Blood Group:</span>
                  <p className="font-semibold text-[#37318B]">{selectedPatient.bloodGroup || '—'}</p>
                </div>
              </div>

              {selectedPatient.address && (
                <div className="p-3 rounded-xl bg-[#FBFBFF] border border-[#E8E6F0]">
                  <span className="text-[#777789]">Residential Address:</span>
                  <p className="font-medium text-[#292743] mt-0.5">{selectedPatient.address}</p>
                </div>
              )}

              {selectedPatient.emergencyContactName && (
                <div className="p-3 rounded-xl bg-[#FBFBFF] border border-[#E8E6F0]">
                  <span className="text-[#777789]">Emergency Contact:</span>
                  <p className="font-semibold text-[#292743]">
                    {selectedPatient.emergencyContactName} • {selectedPatient.emergencyContactPhone}
                  </p>
                </div>
              )}

              {(selectedPatient.allergies || selectedPatient.chronicDiseases) && (
                <div className="space-y-2">
                  {selectedPatient.allergies && (
                    <div className="p-3 rounded-xl bg-[#FDF0F0] border border-rose-200 text-[#EF4444]">
                      <span className="font-bold">Known Allergies: </span>
                      {selectedPatient.allergies}
                    </div>
                  )}
                  {selectedPatient.chronicDiseases && (
                    <div className="p-3 rounded-xl bg-[#FEF6E7] border border-amber-200 text-[#D97706]">
                      <span className="font-bold">Chronic Conditions: </span>
                      {selectedPatient.chronicDiseases}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E8E6F0] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedPatient(null)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedPatient(null)
                  navigate('/book')
                }}
                className="btn-primary text-xs"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#292743]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 sm:p-8 border border-[#E8E6F0] shadow-modal my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E6F0] mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#37318B]">Register New Patient</h2>
                <p className="text-xs text-[#777789]">Fill in patient demographics for clinic records</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-[#777789] hover:text-[#37318B] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-control"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-control"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="input-control"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="input-control"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-control"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-control"
                    placeholder="patient@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="input-control"
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-control"
                    placeholder="123 Health Ave, City"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1">Allergies</label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="input-control"
                    placeholder="e.g. Penicillin, Peanuts"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#37318B] mb-1">Chronic Diseases</label>
                  <input
                    type="text"
                    value={formData.chronicDiseases}
                    onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
                    className="input-control"
                    placeholder="e.g. Hypertension, Asthma"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E6F0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Patients
