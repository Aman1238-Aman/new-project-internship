import mongoose from 'mongoose';
export const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
export const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave'];
const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 24, match: /^[A-Z0-9_-]+$/ },
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { type: String, required: true, trim: true, maxlength: 25, match: /^[+\d][\d\s().-]{5,24}$/ },
  department: { type: String, required: true, enum: DEPARTMENTS },
  role: { type: String, required: true, trim: true, maxlength: 80 },
  joiningDate: { type: Date, required: true },
  status: { type: String, required: true, enum: EMPLOYEE_STATUSES, default: 'Active' },
  skills: { type: [{ type: String, trim: true, maxlength: 40 }], default: [] },
  leaveStart: { type: Date, default: null }, leaveEnd: { type: Date, default: null },
  activeTaskCount: { type: Number, default: 0, min: 0, max: 3, select: true }
}, { timestamps: true, versionKey: false });
employeeSchema.pre('validate', function () {
  if (this.status === 'On Leave') {
    if (!this.leaveStart || !this.leaveEnd) this.invalidate('leaveStart', 'Leave start and end dates are required while On Leave');
    else if (this.leaveEnd < this.leaveStart) this.invalidate('leaveEnd', 'Leave end cannot be earlier than leave start');
  } else { this.leaveStart = null; this.leaveEnd = null; }
});
employeeSchema.index({ department: 1, status: 1, fullName: 1 });
export default mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
