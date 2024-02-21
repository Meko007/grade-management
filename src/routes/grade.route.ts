import { Router } from 'express';
import {
	createGrade,
	getGrades,
	getGradeById,
	updateGrade,
	deleteGrade,
} from '../controllers/grade.controller';
import { isAdmin, verifyToken } from '../middleware/auth';

const router = Router();

router.route('/grades')
	.post(verifyToken, isAdmin, createGrade)
	.get(verifyToken, getGrades);

router.route('/grades/:id')
	.get(verifyToken, getGradeById)
	.put(verifyToken, isAdmin, updateGrade)
	.delete(verifyToken, isAdmin, deleteGrade);

export default router;