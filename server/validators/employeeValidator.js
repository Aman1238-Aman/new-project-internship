import { body, query, param } from 'express-validator';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../models/Employee.js';
export const employeeIdParam = [param('id').isMongoId().withMessage('Invalid employee ID')];
export const employeeQuery = [query('page').optional().isInt({ min: 1 }),query('limit').optional().isInt({ min: 1, max: 100 }),query('department').optional().isIn(DEPARTMENTS),query('status').optional().isIn(EMPLOYEE_STATUSES),query('sort').optional().isIn(['fullName','employeeId','joiningDate','department','status','createdAt']),query('order').optional().isIn(['asc','desc']),query('search').optional().isLength({max:100})];
export const employeeBody = [
 body('employeeId').trim().notEmpty().isLength({ max: 24 }).matches(/^[a-zA-Z0-9_-]+$/),
 body('fullName').trim().isLength({ min: 2, max: 80 }),body('email').trim().isEmail().normalizeEmail({ gmail_remove_dots: false }).isLength({ max: 254 }),
 body('phone').trim().matches(/^[+\d][\d\s().-]{5,24}$/),body('department').isIn(DEPARTMENTS),body('role').trim().isLength({ min: 2, max: 80}),
 body('joiningDate').isISO8601({ strict: true }).withMessage('Joining date must be a valid date'),body('status').optional().isIn(EMPLOYEE_STATUSES),
 body('skills').optional().isArray({ max: 30 }),body('skills.*').optional().isString().trim().isLength({ min: 1,max: 40 }),
 body('leaveStart').if(body('status').equals('On Leave')).isISO8601({ strict: true }),body('leaveEnd').if(body('status').equals('On Leave')).isISO8601({ strict: true }).custom((value,{req})=>{if(req.body.status==='On Leave'&&req.body.leaveStart&&value<req.body.leaveStart)throw new Error('Leave end cannot be earlier than leave start');return true;}),
 body('activeTaskCount').not().exists().withMessage('activeTaskCount is managed by the server')
];
