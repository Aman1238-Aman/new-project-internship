import * as service from '../services/taskService.js';
export const list=async(req,res)=>res.json({success:true,data:await service.listTasks(req.query)});
export const create=async(req,res)=>res.status(201).json({success:true,data:await service.createTask(req.body)});
export const get=async(req,res)=>res.json({success:true,data:await service.getTask(req.params.id)});
export const update=async(req,res)=>res.json({success:true,data:await service.updateTask(req.params.id,req.body)});
export const remove=async(req,res)=>{await service.deleteTask(req.params.id);res.json({success:true,message:'Task deleted'});};
export const status=async(req,res)=>res.json({success:true,data:await service.changeStatus(req.params.id,req.body.status)});
export const exportCsv=async(req,res)=>{const tasks=await service.listTasks(req.query,{paginate:false});const csv=service.toCsv(tasks);res.set({'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="roots-tasks.csv"','Cache-Control':'no-store'}).send(csv);};
