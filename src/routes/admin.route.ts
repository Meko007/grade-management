import { Router } from 'express';
import {
	register,
	login,
	logout,
	forgotPassword,
	resetPassword
} from '../controllers/admin.controller';

const router = Router();

router.post('/admin/register', register);

router.post('/admin/login', login);

router.post('/admin/logout', logout);

router.post('/admin/forgot-password', forgotPassword);

router.post('/admin/reset-password/:resetToken', resetPassword);

export default router;