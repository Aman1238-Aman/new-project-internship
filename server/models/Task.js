import mongoose from 'mongoose';
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const TASK_STATUSES = ['Todo', 'In Progress', 'Completed', 'Cancelled'];
const snapshotSchema = new mongoose.Schema({ employeeId: String, fullName: String, email: String, phone: String, department: String, role: String }, { _id: false });
const taskSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true, immutable: true },
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 4000, default: '' },
  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  employeeSnapshot: { type: snapshotSchema, required: true },
  department: { type: String, required: true, enum: ['Development', 'Design', 'QA', 'HR', 'Sales'] },
  priority: { type: String, required: true, enum: PRIORITIES, default: 'Medium' },
  status: { type: String, required: true, enum: TASK_STATUSES, default: 'Todo' },
  startDate: { type: Date, required: true }, dueDate: { type: Date, required: true },
  createdDate: { type: Date, required: true, default: Date.now, immutable: true }, completedDate: { type: Date, default: null }
}, { timestamps: true, versionKey: false });
taskSchema.index({ status: 1, dueDate: 1 }); taskSchema.index({ department: 1, priority: 1, createdDate: -1 });
export default mongoose.models.Task || mongoose.model('Task', taskSchema);
