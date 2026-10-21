import React, { useState } from 'react';
import {
  X,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Briefcase,
  Plane,
  Coffee,
  Laptop
} from 'lucide-react';
import { User } from '../../types/workhub';

export type QuickActionType = 'time-off' | 'expense' | 'work-hours' | null;

interface QuickActionModalProps {
  actionType: QuickActionType;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSuccessToast?: (msg: string) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  actionType,
  isOpen,
  onClose,
  currentUser,
  onSuccessToast,
}) => {
  if (!isOpen || !actionType) return null;

  // Time Off State
  const [leaveType, setLeaveType] = useState('Vacation');
  const [startDate, setStartDate] = useState('2026-10-20');
  const [endDate, setEndDate] = useState('2026-10-22');
  const [leaveReason, setLeaveReason] = useState('');

  // Expense State
  const [expenseCategory, setExpenseCategory] = useState('Meals & Entertainment');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [receiptAttached, setReceiptAttached] = useState(false);

  // Work Hours State
  const [workDate, setWorkDate] = useState('2026-10-14');
  const [hours, setHours] = useState('8.0');
  const [project, setProject] = useState('Payment Platform');
  const [workSummary, setWorkSummary] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      let successMsg = '';

      if (actionType === 'time-off') {
        successMsg = `Time off request for ${startDate} to ${endDate} (${leaveType}) sent to ${currentUser.managerName || 'your manager'}!`;
      } else if (actionType === 'expense') {
        successMsg = `Expense report for $${expenseAmount || '0.00'} (${merchant || 'Vendor'}) submitted for finance approval!`;
      } else if (actionType === 'work-hours') {
        successMsg = `${hours} hours logged on "${project}" for ${workDate}!`;
      }

      if (onSuccessToast) {
        onSuccessToast(successMsg);
      }
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                actionType === 'time-off'
                  ? 'bg-amber-500'
                  : actionType === 'expense'
                  ? 'bg-emerald-600'
                  : 'bg-blue-600'
              }`}
            >
              {actionType === 'time-off' && <Calendar className="w-5 h-5" />}
              {actionType === 'expense' && <DollarSign className="w-5 h-5" />}
              {actionType === 'work-hours' && <Clock className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                {actionType === 'time-off' && 'Request Time Off'}
                {actionType === 'expense' && 'Submit Expense Claim'}
                {actionType === 'work-hours' && 'Log Timesheet Hours'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {actionType === 'time-off' && 'Submit PTO or leave request for manager approval'}
                {actionType === 'expense' && 'Upload receipt and claim corporate reimbursement'}
                {actionType === 'work-hours' && 'Record billable or sprint project hours for today'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* ================= TIME OFF FORM ================= */}
          {actionType === 'time-off' && (
            <div className="space-y-4 text-xs">
              {/* Balance card */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-amber-900">
                <div>
                  <span className="font-bold text-xs block">Paid Time Off Balance</span>
                  <span className="text-[11px] text-amber-700">Annual standard leave policy</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-amber-900">16.5</span>
                  <span className="text-[11px] text-amber-700 ml-1">days remaining</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Leave Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Vacation', 'Sick Leave', 'Personal', 'Floating Holiday'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLeaveType(type)}
                      className={`p-2 rounded-xl text-center font-semibold border transition cursor-pointer ${
                        leaveType === type
                          ? 'border-amber-500 bg-amber-50 text-amber-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Note for Manager (Optional)</label>
                <textarea
                  rows={2}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g., Annual family vacation. Project handover completed with Arun."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Approval will be routed to reporting manager: {currentUser.managerName || 'John Smith'}.</span>
              </div>
            </div>
          )}

          {/* ================= EXPENSE FORM ================= */}
          {actionType === 'expense' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount ($ USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="85.50"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Merchant / Vendor</label>
                  <input
                    type="text"
                    placeholder="e.g., Blue Bottle Coffee / Uber"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Meals & Entertainment">Meals & Entertainment (Client / Team)</option>
                  <option value="Travel & Transit">Travel & Transit (Rideshare, Flight, Train)</option>
                  <option value="Software & Subscriptions">Software & Developer Subscriptions</option>
                  <option value="Home Office Supplies">Home Office & Ergonomics Equipment</option>
                  <option value="Learning & Books">Learning, Certifications & Books</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Receipt Attachment</label>
                <div
                  onClick={() => setReceiptAttached(!receiptAttached)}
                  className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 transition cursor-pointer text-center ${
                    receiptAttached
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-500'
                  }`}
                >
                  <Upload className={`w-5 h-5 ${receiptAttached ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="font-semibold text-xs">
                    {receiptAttached ? '✓ receipt_oct2026.pdf attached (340 KB)' : 'Click to attach receipt (PNG, JPG, PDF)'}
                  </span>
                  <span className="text-[10px] text-slate-400">Max size: 15MB · Auto-OCR verified</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Purpose</label>
                <input
                  type="text"
                  placeholder="e.g., Team sprint retrospective lunch"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* ================= WORK HOURS FORM ================= */}
          {actionType === 'work-hours' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Assignment</label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="Payment Platform">Payment Platform (FinTech Core)</option>
                  <option value="WorkHub Web Client">WorkHub Web Client (Design System & Frontend)</option>
                  <option value="User Service API">User Service API (Auth & Identity)</option>
                  <option value="Internal Tooling & RAG">Internal AI Assistant & Knowledge Engine</option>
                  <option value="DevOps & Infrastructure">DevOps & Cloud Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Activity / Deliverables Description</label>
                <textarea
                  rows={3}
                  value={workSummary}
                  onChange={(e) => setWorkSummary(e.target.value)}
                  placeholder="e.g., Completed idempotency retry logic, fixed payment gateway timeout edge case, merged PR #245."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 flex items-center justify-between">
                <span className="font-semibold text-xs">Standard Workday: 8.0 hrs</span>
                <span className="font-bold text-blue-700">Timesheet Status: Open</span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 ${
                actionType === 'time-off'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : actionType === 'expense'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {actionType === 'time-off' && 'Submit Leave Request'}
                    {actionType === 'expense' && 'Submit Reimbursement'}
                    {actionType === 'work-hours' && 'Confirm Timesheet Entry'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
