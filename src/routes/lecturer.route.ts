import { Router } from 'express';
import {
	register,
	login,
	logout,
	getLecturers,
	getLecturerById,
	deleteLecturer,
	forgotPassword,
	resetPassword,
	getCourses,
	scoreStudent,
	viewGrades,
	updateLecturer,
	updateStudentScore,
} from '../controllers/lecturer.controller';
import { isAdmin, isLecturer, verifyToken } from '../middleware/auth';

const router = Router();

router.post('/lecturers/register', register);

router.post('/lecturers/login', login);

router.post('/lecturers/logout', logout);

router.get('/lecturers', verifyToken, isAdmin, getLecturers);

router.post('/lecturers/forgot-password', forgotPassword);

router.post('/lecturers/reset-password/:resetToken', resetPassword);

router.get('/lecturer/courses', verifyToken, isLecturer, getCourses);

router.route('/lecturer/scores/:sessionId/:semesterId')
	.post(verifyToken, isLecturer, scoreStudent)
	.put(verifyToken, isLecturer, updateStudentScore)
	.get(verifyToken, isLecturer, viewGrades);

router.route('/lecturers/:id')
	.get(verifyToken, isAdmin, getLecturerById)
	.put(verifyToken, isAdmin, updateLecturer)
	.delete(verifyToken, isAdmin, deleteLecturer);

export default router;