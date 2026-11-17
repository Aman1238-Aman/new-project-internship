import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import AppError from '../utils/AppError.js';
import { dateOnly } from '../utils/dates.js';

const SORTS = new Set(['fullName','employeeId','joiningDate','department','status','createdAt']);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function normalize(body) { const clean = { ...body, employeeId: body.employeeId?.trim().toUpperCase(), email: body.email?.trim().toLowerCase(), fullName: body.fullName?.trim(), skills: (body.skills || []).map(x => x.trim()).filter(Boolean) }; delete clean.activeTaskCount; if (clean.status !== 'On Leave') clean.leaveStart = clean.leaveEnd = null; else { clean.leaveStart = dateOnly(clean.leaveStart); clean.leaveEnd = dateOnly(clean.leaveEnd); } if (clean.joiningDate) clean.joiningDate = dateOnly(clean.joiningDate); return clean; }
export async function listEmployees(q) {
 const page = Number(q.page) || 1, limit = Number(q.limit) || 10, match = {};
 if (q.department) match.department = q.department; if (q.status) match.status = q.status;
 if (q.search?.trim()) { const re = new RegExp(escapeRegex(q.search.trim()), 'i'); match.$or = [{ fullName: re }, { email: re }, { employeeId: re }, { role: re }]; }
 const sortKey = SORTS.has(q.sort) ? q.sort : 'fullName', direction = q.order === 'desc' ? -1 : 1;
 const [items,total] = await Promise.all([Employee.find(match).sort({ [sortKey]: direction, _id: 1 }).skip((page-1)*limit).limit(limit).lean(), Employee.countDocuments(match)]);
 return { items, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total/limit)) } };
}
export async function createEmployee(body) { const clean = normalize(body); if (await Employee.exists({ $or: [{ employeeId: clean.employeeId }, { email: clean.email }] })) throw new AppError('Employee ID or email already exists',409,'DUPLICATE'); return Employee.create(clean); }
export async function getEmployee(id) { const e = await Employee.findById(id).lean(); if (!e) throw new AppError('Employee not found',404,'NOT_FOUND'); return e; }
export async function updateEmployee(id,body) {
 const clean=normalize(body); delete clean.activeTaskCount;
 try { const e=await Employee.findByIdAndUpdate(id,{$set:clean},{new:true,runValidators:true,context:'query'}).lean(); if(!e)throw new AppError('Employee not found',404,'NOT_FOUND'); return e; }
 catch(err){if(err.code===11000)throw new AppError('Employee ID or email already exists',409,'DUPLICATE');throw err;}
}
export async function deleteEmployee(id) {
 const employee = await Employee.findById(id).lean(); if (!employee) throw new AppError('Employee not found',404,'NOT_FOUND');
 const active = employee.activeTaskCount || await Task.countDocuments({ assignedEmployee:id, status:{ $in:['Todo','In Progress'] } });
 if (active > 0) throw new AppError('Employee cannot be deleted while they have active tasks',409,'ACTIVE_TASKS');
 const removed = await Employee.findOneAndDelete({ _id:id, activeTaskCount:0 }).lean();
 if (!removed) throw new AppError('Employee has active tasks and cannot be deleted',409,'ACTIVE_TASKS');
 return removed;
}
