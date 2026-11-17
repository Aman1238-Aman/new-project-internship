import * as service from '../services/employeeService.js';
export const list = async(req,res)=>res.json({success:true,data:await service.listEmployees(req.query)});
export const create = async(req,res)=>res.status(201).json({success:true,data:await service.createEmployee(req.body)});
export const get = async(req,res)=>res.json({success:true,data:await service.getEmployee(req.params.id)});
export const update = async(req,res)=>res.json({success:true,data:await service.updateEmployee(req.params.id,req.body)});
export const remove = async(req,res)=>{await service.deleteEmployee(req.params.id);res.json({success:true,message:'Employee deleted'});};
