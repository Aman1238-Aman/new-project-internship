import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { isOverdue } from '../utils/dates.js';
export async function dashboard(_req,res){
 const [employeeCounts,taskRows,workload]=await Promise.all([
  Employee.aggregate([{$group:{_id:'$status',count:{$sum:1}}}]),
  Task.find({},'status dueDate').lean(),
  Employee.find({},'employeeId fullName department status activeTaskCount').sort({fullName:1}).lean()
 ]);
 const ec=Object.fromEntries(employeeCounts.map(x=>[x._id,x.count]));const tc={total:taskRows.length,todo:0,inProgress:0,completed:0,cancelled:0,overdue:0};
 for(const task of taskRows){if(task.status==='Todo')tc.todo++;else if(task.status==='In Progress')tc.inProgress++;else if(task.status==='Completed')tc.completed++;else if(task.status==='Cancelled')tc.cancelled++;if(isOverdue(task))tc.overdue++;}
 res.json({success:true,data:{employees:{total:workload.length,active:ec.Active||0,inactive:ec.Inactive||0,onLeave:ec['On Leave']||0},tasks:tc,workload:workload.map(e=>({employeeId:e.employeeId,fullName:e.fullName,department:e.department,status:e.status,activeTaskCount:e.activeTaskCount||0}))}});
}
