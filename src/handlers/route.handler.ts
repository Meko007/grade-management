import { Router } from 'express';
import session from '../routes/session.route';
import semester from '../routes/semester.route';
import school from '../routes/school.route';
import dept from '../routes/dept.route';
import admin from '../routes/admin.route';
import lecturer from '../routes/lecturer.route';
import student from '../routes/student.route';
import course from '../routes/course.route';
import grade from '../routes/grade.route';

const router = Router();

router.use(session);
router.use(semester);
router.use(school);
router.use(dept);
router.use(admin);
router.use(lecturer);
router.use(student);
router.use(course);
router.use(grade);

export default router;