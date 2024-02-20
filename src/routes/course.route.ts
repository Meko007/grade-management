import { Router } from 'express';
import {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
} from '../controllers/course.controller';
import { verifyToken, isAdmin } from '../middleware/auth';

const router = Router();

router.route('/courses')
    .post(verifyToken, isAdmin, createCourse)
    .get(verifyToken, getCourses);

router.route('/courses/:id')
    .get(verifyToken, getCourseById)
    .put(verifyToken, isAdmin, updateCourse)
    .delete(verifyToken, isAdmin, deleteCourse);

export default router;