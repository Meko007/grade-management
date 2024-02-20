import { Router } from 'express';
import {
    register,
    login,
    getStudents,
    getStudentById,
    updateStudents,
    deleteStudent,
    logout,
    registerCourse,
    getCourses,
    viewGrades,
    forgotPassword,
    resetPassword,
} from '../controllers/student.controller';
import { isAdmin, isStudent, verifyToken } from '../middleware/auth';

const router = Router();

router.post('/students/register', register);

router.post('/students/login', login);

router.post('/students/logout', logout);

router.route('/students')
    .get(verifyToken, isAdmin, getStudents)
    .put(verifyToken, isAdmin, updateStudents)

router.post('/student/my-courses/:semesterId', verifyToken, isStudent, registerCourse);


router.get('/student/my-courses/:level/:semesterId', verifyToken, isStudent, getCourses);

router.route('/student/view-grades')
.get(verifyToken, isStudent, viewGrades)

router.post('/students/forgot-password', forgotPassword);

router.post('/students/reset-password/:resetToken', resetPassword);

router.route('/students/:id')
    .get(verifyToken, isAdmin, getStudentById)
    .delete(verifyToken, isAdmin, deleteStudent);

export default router;