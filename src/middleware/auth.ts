import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import 'dotenv/config';

const secret = process.env.JWT_SECRET as string;

export interface customReq extends Request {
    token: string | JwtPayload;
}

export const createToken = (id: string | number, email: string, role: string) => {
	const token = jwt.sign({
		id,
		email,
		role,
	}, secret, { expiresIn: '1h' });
	return token;
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.cookies.jwtToken;
    
		if (!token) {
			return res.status(401).json({ message: 'Auth token missing' });
		}
    
		const decodedToken = jwt.verify(token, secret);
		(req as customReq).token = decodedToken;
		next();     
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = (req as customReq).token;
	
		user && (user as JwtPayload).role === 'admin'
			? next()
			: res.status(403).json({ message: 'Admin access required' });
	} catch (error) {
		res.status(500).json({ message: 'Internal Server Error' });
		console.error(error);
	}
};

export const isLecturer = (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = (req as customReq).token;
	
		user && (user as JwtPayload).role === 'lect'
			? next()
			: res.status(403).json({ message: 'This route is just for lecturers' });
	} catch (error) {
		res.status(500).json({ message: 'Internal Server Error' });
		console.error(error);
	}
};

export const isStudent = (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = (req as customReq).token;
	
		user && (user as JwtPayload).role === 'stud'
			? next()
			: res.status(403).json({ message: 'This route is just for students' });
	} catch (error) {
		res.status(500).json({ message: 'Internal Server Error' });
		console.error(error);
	}
};