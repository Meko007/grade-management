import { Router } from 'express';
import {
    createDept,
    getDepts,
    getDeptById,
    updateDept,
    deleteDept,
} from '../controllers/dept.controller';
import { isAdmin, verifyToken } from '../middleware/auth';

const router = Router();

router.route('/depts')
    .post(verifyToken, isAdmin, createDept)
    .get(verifyToken, getDepts);

router.route('/depts/:id')
    .get(verifyToken, getDeptById)
    .put(verifyToken, isAdmin, updateDept)
    .delete(verifyToken, isAdmin, deleteDept);

export default router;