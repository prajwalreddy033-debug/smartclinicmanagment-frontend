import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api'

export const fetchPrescriptions = createAsyncThunk(
  'prescriptions/fetchPrescriptions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/prescriptions', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch prescriptions')
    }
  }
)

export const createPrescription = createAsyncThunk(
  'prescriptions/createPrescription',
  async (prescriptionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/prescriptions', prescriptionData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create prescription')
    }
  }
)

export const downloadPrescriptionPdf = createAsyncThunk(
  'prescriptions/downloadPrescriptionPdf',
  async (prescriptionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/prescriptions/${prescriptionId}/pdf`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `prescription-${prescriptionId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      return true
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download prescription')
    }
  }
)

const prescriptionSlice = createSlice({
  name: 'prescriptions',
  initialState: {
    prescriptions: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.loading = false
        const data = action.payload
        state.prescriptions = Array.isArray(data) ? data : data?.content || []
        state.totalElements = data?.totalElements
        state.totalPages = data?.totalPages
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.prescriptions.push(action.payload)
      })
  },
})

export const { clearError } = prescriptionSlice.actions
export default prescriptionSlice.reducer
