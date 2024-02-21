import { Router } from 'express';
import {
	createSchool,
	getSchools,
	getSchoolById,
	updateSchool,
	deleteSchool,
	getDepts
} from '../controllers/school.controller';
import { isAdmin, verifyToken } from '../middleware/auth';

const router = Router();

router.route('/schools')
	.post(verifyToken, isAdmin, createSchool)
	.get(verifyToken, getSchools);

router.route('/schools/:id')
	.get(verifyToken, getSchoolById)
	.put(verifyToken, isAdmin, updateSchool)
	.delete(verifyToken, isAdmin, deleteSchool);

router.route('/school-depts/:id')
	.get(verifyToken, getDepts);

export default router;