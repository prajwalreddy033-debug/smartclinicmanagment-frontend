import { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchBills, processPayment } from '../store/slices/billingSlice'
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  FileText,
  Printer,
  ArrowRight,
  User,
  Shield,
  Layers,
  Sparkles,
  Percent,
  Wallet,
  Receipt,
  Building,
  Check,
  X
} from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/formatters'

const PAYMENT_METHODS = [
  { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'CASH', label: 'Cash Counter', icon: DollarSign },
  { id: 'UPI', label: 'UPI / Digital Wallet', icon: Wallet },
  { id: 'INSURANCE', label: 'Health Insurance', icon: Shield },
  { id: 'ONLINE', label: 'Online Bank Wire', icon: Building },
]

const Billing = () => {
  const dispatch = useDispatch()
  const { bills, loading } = useSelector((state) => state.billing)
  const { user } = useSelector((state) => state.auth)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, PAID, PARTIALLY_PAID, UNPAID

  // Modals state
  const [selectedBill, setSelectedBill] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'CARD',
    notes: '',
  })

  useEffect(() => {
    dispatch(fetchBills())
  }, [dispatch])

  // Financial statistics calculations
  const totalBilled = useMemo(() => bills.reduce((sum, b) => sum + (Number(b.netAmount) || 0), 0), [bills])
  const totalCollected = useMemo(() => bills.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0), [bills])
  const totalOutstanding = useMemo(() => bills.reduce((sum, b) => {
    const due = Number(b.dueAmount) !== undefined ? Number(b.dueAmount) : Math.max(0, (Number(b.netAmount) || 0) - (Number(b.paidAmount) || 0))
    return sum + due
  }, 0), [bills])
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100

  // Filtered bills
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(searchLower)) ||
        (b.patientName && b.patientName.toLowerCase().includes(searchLower)) ||
        (b.patientCode && b.patientCode.toLowerCase().includes(searchLower)) ||
        (b.patientPhone && b.patientPhone.toLowerCase().includes(searchLower))

      const matchesStatus =
        statusFilter === 'ALL' ? true : b.paymentStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [bills, searchTerm, statusFilter])

  const openPaymentModal = (bill) => {
    const due = bill.dueAmount !== undefined ? bill.dueAmount : Math.max(0, bill.netAmount - (bill.paidAmount || 0))
    setSelectedBill(bill)
    setPaymentForm({
      amount: due.toString(),
      paymentMethod: 'CARD',
      notes: '',
    })
    setPaymentError(null)
    setShowPaymentModal(true)
  }

  const openInvoiceModal = (bill) => {
    setSelectedBill(bill)
    setShowInvoiceModal(true)
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    if (!selectedBill) return
    setProcessing(true)
    setPaymentError(null)

    const amountNum = parseFloat(paymentForm.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setPaymentError('Please enter a valid payment amount greater than zero.')
      setProcessing(false)
      return
    }

    const res = await dispatch(
      processPayment({
        billId: selectedBill.id,
        paymentData: {
          amount: amountNum,
          paymentMethod: paymentForm.paymentMethod,
          notes: paymentForm.notes || 'Counter settlement',
        },
      })
    )

    setProcessing(false)
    if (res.error) {
      setPaymentError(res.payload || 'Payment processing failed.')
    } else {
      setShowPaymentModal(false)
      dispatch(fetchBills())
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return 'badge-completed'
      case 'PARTIALLY_PAID':
        return 'badge-pending'
      case 'UNPAID':
        return 'badge-cancelled'
      default:
        return 'badge-scheduled'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-3 h-3 text-emerald-600" />
      case 'PARTIALLY_PAID':
        return <Clock className="w-3 h-3 text-amber-600" />
      case 'UNPAID':
        return <AlertCircle className="w-3 h-3 text-rose-600" />
      default:
        return <AlertCircle className="w-3 h-3 text-slate-600" />
    }
  }

  const canProcessPayment = user?.role === 'RECEPTIONIST' || user?.role === 'CLINIC_ADMIN' || user?.role === 'ADMIN'

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8E6F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8278E8] uppercase tracking-wider mb-1">
            <span className="w-6 h-6 rounded-lg bg-[#F0EFFF] flex items-center justify-center text-[#37318B]">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
            <span>Revenue & Accounts Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-[#37318B] tracking-tight">Billing & Invoices</h1>
          <p className="text-sm text-[#777789] mt-0.5">
            Track clinic invoicing, patient co-pays, insurance claims, and real-time cash collections.
          </p>
        </div>
      </div>

      {/* Financial KPIs Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="smart-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#777789]">Gross Billings</p>
            <p className="text-2xl font-bold text-[#37318B] mt-1">{formatCurrency(totalBilled)}</p>
            <p className="text-[11px] text-[#777789] mt-0.5">{bills.length} invoices generated</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F0EFFF] flex items-center justify-center text-[#37318B]">
            <Receipt className="w-5 h-5 text-[#8278E8]" />
          </div>
        </div>

        <div className="smart-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#777789]">Collected Revenue</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalCollected)}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">{collectionRate}% collected</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#E8F8F0] flex items-center justify-center text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="smart-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#777789]">Pending Balance</p>
            <p className="text-2xl font-bold text-[#EF4444] mt-1">{formatCurrency(totalOutstanding)}</p>
            <p className="text-[11px] text-[#EF4444] mt-0.5 font-medium">Unsettled counter due</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FDF0F0] flex items-center justify-center text-[#EF4444]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="smart-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#777789]">Recovery Ratio</p>
            <p className="text-2xl font-bold text-[#8278E8] mt-1">{collectionRate}%</p>
            <p className="text-[11px] text-[#8278E8] mt-0.5 font-medium">Settlement efficiency</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#DFF6FC] flex items-center justify-center text-[#0284C7]">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="smart-card p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777789]" />
            <input
              type="text"
              placeholder="Search by invoice #, patient name, MRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-control pl-10"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'UNPAID', 'PARTIALLY_PAID', 'PAID'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-[#37318B] text-white shadow-sm'
                    : 'bg-[#F0EFFF] text-[#37318B] hover:bg-[#E8E6F0]'
                }`}
              >
                {st === 'ALL' ? 'All Invoices' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Directory Table */}
      <div className="smart-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0EFFF]/50 border-b border-[#E8E6F0] text-xs font-semibold text-[#777789] uppercase tracking-wider">
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Patient Details</th>
                <th className="px-5 py-3.5">Bill Amount</th>
                <th className="px-5 py-3.5">Paid / Settled</th>
                <th className="px-5 py-3.5">Balance Due</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E6F0]/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[#777789]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-9 h-9 border-3 border-[#8278E8] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium text-[#777789]">Loading invoice ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[#777789]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt className="w-10 h-10 text-[#8278E8] stroke-1" />
                      <p className="font-bold text-[#37318B]">No invoices match criteria</p>
                      <p className="text-xs text-[#777789]">Check your filter or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const due =
                    bill.dueAmount !== undefined
                      ? Number(bill.dueAmount)
                      : Math.max(0, (Number(bill.netAmount) || 0) - (Number(bill.paidAmount) || 0))

                  return (
                    <tr key={bill.id} className="hover:bg-[#F0EFFF]/30 transition group">
                      {/* Invoice Number & Date */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#37318B] group-hover:text-[#E94E9B] transition">
                          {bill.invoiceNumber}
                        </div>
                        <div className="text-xs text-[#777789] mt-0.5">{formatDate(bill.createdAt)}</div>
                      </td>

                      {/* Patient Details */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#292743]">
                          {bill.patientName || `Patient #${bill.patientId}`}
                        </div>
                        <div className="text-xs text-[#777789] font-mono mt-0.5">
                          {bill.patientCode || (bill.patientPhone ? `Ph: ${bill.patientPhone}` : 'Outpatient')}
                        </div>
                      </td>

                      {/* Net Amount */}
                      <td className="px-5 py-4 font-bold text-[#37318B]">
                        {formatCurrency(bill.netAmount)}
                      </td>

                      {/* Paid Amount */}
                      <td className="px-5 py-4 text-emerald-600 font-semibold">
                        {formatCurrency(bill.paidAmount || 0)}
                      </td>

                      {/* Balance Due */}
                      <td className="px-5 py-4">
                        <span
                          className={`font-semibold ${
                            due > 0 ? 'text-[#EF4444] font-mono font-bold' : 'text-[#777789] font-mono'
                          }`}
                        >
                          {formatCurrency(due)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`badge ${getStatusBadge(bill.paymentStatus)} flex items-center gap-1.5`}>
                          {getStatusIcon(bill.paymentStatus)}
                          {bill.paymentStatus?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Invoice Dossier */}
                          <button
                            onClick={() => openInvoiceModal(bill)}
                            className="p-2 text-[#777789] hover:text-[#37318B] hover:bg-[#F0EFFF] rounded-xl transition border border-transparent hover:border-[#E8E6F0]"
                            title="View Itemized Invoice & Print Receipt"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Process Payment Modal */}
                          {canProcessPayment && bill.paymentStatus !== 'PAID' && (
                            <button
                              onClick={() => openPaymentModal(bill)}
                              className="btn-primary inline-flex items-center gap-1.5 text-xs py-1.5 px-3.5 shadow-sm"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROCESS PAYMENT MODAL */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-[#292743]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#E8E6F0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E6F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F0EFFF] text-[#37318B] flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#8278E8]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#37318B]">Process Counter Payment</h3>
                  <p className="text-xs text-[#777789]">Invoice: {selectedBill.invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F0EFFF] flex items-center justify-center text-[#777789] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentError && (
              <div className="mt-3 p-3 bg-[#FDF0F0] border border-[#EF4444]/20 text-[#EF4444] text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-4">
              {/* Outstanding Balance Summary Card */}
              {(() => {
                const due =
                  selectedBill.dueAmount !== undefined
                    ? Number(selectedBill.dueAmount)
                    : Math.max(0, (Number(selectedBill.netAmount) || 0) - (Number(selectedBill.paidAmount) || 0))

                return (
                  <div className="p-3.5 bg-[#F0EFFF]/60 rounded-2xl border border-[#E8E6F0] space-y-1.5 text-xs text-[#777789]">
                    <div className="flex justify-between">
                      <span>Patient:</span>
                      <span className="font-bold text-[#37318B]">{selectedBill.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Invoice Total:</span>
                      <span className="font-semibold text-[#292743]">{formatCurrency(selectedBill.netAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Previously Settled:</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(selectedBill.paidAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#E8E6F0] font-bold text-sm">
                      <span className="text-[#EF4444]">Outstanding Balance:</span>
                      <span className="text-[#EF4444]">{formatCurrency(due)}</span>
                    </div>
                  </div>
                )
              })()}

              {/* Amount Input with Quick-Fill Shortcuts */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#37318B] uppercase tracking-wider">
                    Settlement Amount ($) *
                  </label>
                  {/* Quick-fill button */}
                  {(() => {
                    const due =
                      selectedBill.dueAmount !== undefined
                        ? Number(selectedBill.dueAmount)
                        : Math.max(0, (Number(selectedBill.netAmount) || 0) - (Number(selectedBill.paidAmount) || 0))
                    return (
                      <button
                        type="button"
                        onClick={() => setPaymentForm({ ...paymentForm, amount: due.toString() })}
                        className="text-[11px] text-[#E94E9B] font-semibold hover:underline"
                      >
                        Fill Full Due (${due})
                      </button>
                    )
                  })()}
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="input-control text-base font-bold font-mono"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#37318B] uppercase tracking-wider mb-2">
                  Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((pm) => {
                    const Icon = pm.icon
                    const isSelected = paymentForm.paymentMethod === pm.id
                    return (
                      <button
                        type="button"
                        key={pm.id}
                        onClick={() => setPaymentForm({ ...paymentForm, paymentMethod: pm.id })}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition ${
                          isSelected
                            ? 'border-[#37318B] bg-[#F0EFFF] text-[#37318B] ring-2 ring-[#8278E8]'
                            : 'border-[#E8E6F0] hover:bg-[#F0EFFF]/40 text-[#777789]'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#8278E8] flex-shrink-0" />
                        <span className="truncate">{pm.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Reference / Cashier Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#37318B] uppercase tracking-wider mb-1.5">
                  Receipt Reference / Notes
                </label>
                <input
                  type="text"
                  placeholder="Card auth code / Cash receipt # / UPI ref..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="input-control text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-[#E8E6F0]">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="btn-primary flex-1 inline-flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {processing ? 'Processing...' : 'Confirm Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ITEMIZED INVOICE DOSSIER / PRINTABLE RECEIPT MODAL */}
      {showInvoiceModal && selectedBill && (
        <div className="fixed inset-0 bg-[#292743]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl border border-[#E8E6F0] max-h-[92vh] overflow-y-auto">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E6F0] no-print">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8278E8]">
                Tax Invoice & Clinical Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-secondary inline-flex items-center gap-1.5 text-xs py-1.5 px-3"
                >
                  <Printer className="w-3.5 h-3.5 text-[#37318B]" />
                  Print / Export
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-[#F0EFFF] flex items-center justify-center text-[#777789] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div className="pt-6 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#37318B] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      SC
                    </div>
                    <span className="text-xl font-bold text-[#37318B]">SmartClinic Health</span>
                  </div>
                  <p className="text-xs text-[#777789] mt-1">Multi-Specialty Clinical Center</p>
                  <p className="text-xs text-[#777789]">License: MED-CLINIC-2024</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-[#37318B] block">{selectedBill.invoiceNumber}</span>
                  <p className="text-xs text-[#777789]">Date: {formatDate(selectedBill.createdAt)}</p>
                  <span className={`badge ${getStatusBadge(selectedBill.paymentStatus)} inline-flex items-center gap-1 mt-1`}>
                    {getStatusIcon(selectedBill.paymentStatus)}
                    {selectedBill.paymentStatus?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Patient Profile */}
              <div className="p-4 bg-[#F0EFFF]/60 rounded-2xl border border-[#E8E6F0] grid grid-cols-2 gap-3 text-xs text-[#292743]">
                <div>
                  <span className="text-[#777789] block">Billed Patient:</span>
                  <span className="font-bold text-[#37318B] text-sm">{selectedBill.patientName}</span>
                  {selectedBill.patientCode && <p className="font-mono text-[#777789]">MRN: {selectedBill.patientCode}</p>}
                </div>
                <div>
                  <span className="text-[#777789] block">Payment Method:</span>
                  <span className="font-medium text-[#292743]">{selectedBill.paymentMethod || 'Counter Settlement'}</span>
                  {selectedBill.notes && <p className="text-[#777789] italic mt-0.5">Notes: {selectedBill.notes}</p>}
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E8E6F0] text-[#777789] uppercase tracking-wider font-semibold">
                      <th className="py-2.5">Item Description</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5 text-center">Qty</th>
                      <th className="py-2.5 text-right">Unit Price</th>
                      <th className="py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E6F0]/60 text-[#292743]">
                    {selectedBill.items && selectedBill.items.length > 0 ? (
                      selectedBill.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 font-medium text-[#37318B]">{item.itemName}</td>
                          <td className="py-3 text-[#777789]">{item.itemCategory || 'Clinical Service'}</td>
                          <td className="py-3 text-center">{item.quantity}</td>
                          <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-3 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-3 font-medium text-[#37318B]">Physician Clinical Consultation</td>
                        <td className="py-3 text-[#777789]">Consultation</td>
                        <td className="py-3 text-center">1</td>
                        <td className="py-3 text-right">{formatCurrency(selectedBill.totalAmount || selectedBill.netAmount)}</td>
                        <td className="py-3 text-right font-medium">{formatCurrency(selectedBill.totalAmount || selectedBill.netAmount)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals Calculation */}
              <div className="border-t border-[#E8E6F0] pt-4 flex justify-end">
                <div className="w-64 space-y-2 text-xs text-[#777789]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium text-[#292743]">
                      {formatCurrency(selectedBill.totalAmount || selectedBill.netAmount)}
                    </span>
                  </div>
                  {selectedBill.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount Applied:</span>
                      <span>-{formatCurrency(selectedBill.discountAmount)}</span>
                    </div>
                  )}
                  {selectedBill.taxAmount > 0 && (
                    <div className="flex justify-between text-[#777789]">
                      <span>Applicable Tax / VAT:</span>
                      <span>+{formatCurrency(selectedBill.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-[#E8E6F0] text-sm font-bold text-[#37318B]">
                    <span>Net Payable:</span>
                    <span>{formatCurrency(selectedBill.netAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Paid to Date:</span>
                    <span>{formatCurrency(selectedBill.paidAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#E8E6F0] font-bold text-[#EF4444]">
                    <span>Balance Outstanding:</span>
                    <span>
                      {formatCurrency(
                        selectedBill.dueAmount !== undefined
                          ? selectedBill.dueAmount
                          : Math.max(0, (selectedBill.netAmount || 0) - (selectedBill.paidAmount || 0))
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-[#E8E6F0] text-center text-[11px] text-[#777789]">
                <p>Thank you for choosing SmartClinic Health Systems. For billing inquiries, contact billing@smartclinic.com</p>
                <p className="mt-1 font-mono text-[10px]">Document Hash: {selectedBill.id}-SC-{new Date().getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Billing
