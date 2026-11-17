import { Router } from 'express';
import * as controller from '../controllers/employeeController.js';
import { employeeBody, employeeIdParam, employeeQuery } from '../validators/employeeValidator.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router=Router();
router.route('/').get(employeeQuery,validate,asyncHandler(controller.list)).post(employeeBody,validate,asyncHandler(controller.create));
router.route('/:id').get(employeeIdParam,validate,asyncHandler(controller.get)).put([...employeeIdParam,...employeeBody],validate,asyncHandler(controller.update)).delete(employeeIdParam,validate,asyncHandler(controller.remove));
export default router;
