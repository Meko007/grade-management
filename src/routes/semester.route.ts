import { Router } from 'express';
import {
	createSemester,
	getSemesters,
	getSemesterById,
	deleteSemester,
} from '../controllers/semester.controller';
import { isAdmin, verifyToken } from '../middleware/auth';

const router = Router();

router.route('/semesters')
	.post(verifyToken, isAdmin, createSemester)
	.get(isAdmin, getSemesters);

router.route('/semesters/:id')
	.get(isAdmin, getSemesterById)
	.delete(verifyToken, isAdmin, deleteSemester);

export default router;