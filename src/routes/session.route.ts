import { Router } from 'express';
import {
    createSession,
    getSessions,
    getSessionById,
    deleteSession,
} from '../controllers/session.controller';
import { isAdmin, verifyToken, } from '../middleware/auth';

const router = Router();

router.route('/sessions')
    .post(verifyToken, isAdmin, createSession)
    .get(verifyToken, getSessions);

router.route('/sessions/:id')
    .get(verifyToken, getSessionById)
    .delete(verifyToken, isAdmin, deleteSession);

export default router;