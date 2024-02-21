import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createToken, customReq } from '../middleware/auth';
import { JwtPayload } from 'jsonwebtoken';
import {
	capitalizeName, 
	checkName, 
	emailAddress, 
	isEmail,
	isValidDeptId, 
	levelCheck, 
	random, 
	transporter 
} from '../utils/util';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
	try {
		const { id, firstName, lastName, email, password, deptId } = req.body;

		const studentExists  = await prisma.student.findUnique({ where: { id } });

		if (studentExists) {
			return res.status(409).json({ message: `Student with matric number (${id}) exists` });
		}

		if (checkName(firstName) || checkName(lastName)) {
			return res.status(422).json({ message: 'Your name can\'t contain special characters or numbers besides "-"' });
		}

		if (!isEmail(email)) {
			return res.status(422).json({ message: 'Enter a valid email' });
		}

		if (!isValidDeptId(deptId)) {
			return res.status(422).json({ message: 'Invalid department ID' });
		}
    
		const hash = await bcrypt.hash(password, 10);

		const newStud = await prisma.student.create({
			data: {
				id,
				firstName: capitalizeName(firstName),
				lastName: capitalizeName(lastName),
				email,
				password: hash,
				deptId: deptId.toUpperCase(),
			},
		});
		res.status(201).json(newStud);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
    
		const student = await prisma.student.findUnique({ where: { email } });
    
		if (!student) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}
        
		if (student && (await bcrypt.compare(password, student.password))) {
			const token = createToken(student.id, student.email, student.role);
			res.cookie('jwtToken', token, { maxAge: 1000 * 60 * 30, httpOnly: true, secure: true, sameSite: 'lax' });
			res.status(200).json({ message: 'Logged in successfully' });
		} else {
			return res.status(401).json({ message: 'Invalid email or password' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const logout = async (req: Request, res: Response) => {
	try {
		res.clearCookie('jwtToken');
		res.status(200).json({ message: 'Logged out successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getStudents = async (req: Request, res: Response) => {
	try {
		const students = await prisma.student.findMany();
		res.status(200).json(students);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getStudentById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const student = await prisma.student.findUnique({ where: { id } });

		if (!student) {
			return res.status(404).json({ message: 'student not found' });
		}

		res.status(200).json(student);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const updateStudents = async (req: Request, res: Response) => {
	try {
		const { level, customLevel } = req.body;

		if (customLevel && !levelCheck(Number(customLevel))) {
			return res.status(422).json({ message: 'Invalid level input' });
		}

		let newLevel = 0;

		if (Number(level) === 100) {
			newLevel = 200;
		} else if (Number(level) === 200) {
			newLevel = 300;
		} else if (Number(level) === 300) {
			newLevel = 400;
		} else if (Number(level) === 400) {
			newLevel = 500;
		} else if (Number(level) === 500) {
			newLevel = 600;
		} else {
			return res.status(404).json({ message: 'No level above 600' });
		}

		const students = await prisma.student.updateMany({
			where: {
				level: Number(level),
			},
			data: {
				level: Number(customLevel) || newLevel,
			}
		});

		if (students.count === 0) {
			return res.status(404).json({ message: 'No students at this level' });
		}
        
		res.status(200).json({ message: 'Updated successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const deleteStudent = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const student = await prisma.student.delete({ where: { id } });

		if (!student) {
			return res.status(404).json({ message: 'student not found' });
		}
		res.status(200).json({
			message: 'deleted',
			student
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { id, email } = req.body;
		const student = await prisma.student.findUnique({
			where: {
				id,
				email,
			},
		});

		if (!student) {
			return res.status(404).json({ message: 'student not found' });
		}

		const resetToken = random(10);

		await prisma.student.update({
			where: {
				id,
				email,
			},
			data: {
				resetToken
			},
		});

		const mailOptions = {
			from: emailAddress,
			to: email,
			subject: 'Password Reset',
			text: `Click on this link: http://localhost:5000/api/v1/students/reset-password/${resetToken}`,
		};

		await transporter.sendMail(mailOptions);
		res.status(200).json({ message: 'Password reset token sent' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const resetPassword = async (req: Request, res: Response) => {
	try {
		const { resetToken } = req.params;
		const { newPassword } = req.body;
		const student = await prisma.student.findFirst({
			where: {
				resetToken,
			},
		});

		if (!student) {
			return res.status(404).json({ message: 'page not found' });
		}

		const hash = await bcrypt.hash(newPassword, 10);

		await prisma.student.update({
			where: {
				id: student.id 
			},
			data: {
				password: hash,
				resetToken: null
			},
		});
		res.status(200).json({ message: 'Password has been reset' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const registerCourse = async (req: Request, res: Response) => {
	try {
		const studentId = ((req as customReq).token as JwtPayload).id;
		const { semesterId } = req.params;
		const { courseId } = req.body;

		const course = await prisma.course.findUnique({ where: { id: courseId } });

		if (!course) {
			return res.status(404).json({ message: 'course not found' });
		}

		if (course.semesterId !== Number(semesterId)) {
			return res.status(400).json({ message: 'semesters don\'t match' });
		}

		const isRegistered = await prisma.student.findFirst({
			where: {
				id: studentId,
				courses: { some: { id: courseId } },
			},
		});

		if (isRegistered) {
			return res.status(400).json({ message: 'course already registered for' });
		}

		await prisma.student.update({
			where: { id: studentId },
			data: { courses: { connect: { id: courseId } } },
		});
		res.status(201).json({ message: `${courseId} registration successful` });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getCourses = async (req: Request, res: Response) => {
	try {
		const { id } = (req as customReq).token as JwtPayload;
		const { level, semesterId } = req.params;
		const courses = await prisma.student.findMany({
			where: { id },
			include: {
				courses: {
					where: {
						level: Number(level),
						semesterId: Number(semesterId),
					},
				},
			},
			orderBy: {
				firstName: 'asc',
			},
		});
		res.status(200).json(courses);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const viewGrades = async (req: Request, res: Response) => {
	try {
		const { id } = (req as customReq).token as JwtPayload;
		const { sessionId, semesterId } = req.query;
		// const student = await prisma.student.findUnique({
		//     where: { id },
		// });

		// const scores = await prisma.student.findMany({
		//     where: { id },
		//     include: {
		//         scores: {
		//             where: {
		//                 sessionId: sessionId,
		//                 semesterId: parseInt(semesterId, 10),
		//             },
		//         },
		//     },
		// });

		const scores = await prisma.score.findMany({
			where: {
				studentId: id,
				sessionId: String(sessionId),
				semesterId: parseInt(String(semesterId), 10),
			},
			include: {
				course: {
					select: {
						unit: true,
					},
				},
				grade: {
					select: {
						gradePoint: true,
					},
				},
			},
		});

		if (scores.length === 0) {
			return res.status(404).json({ message: 'You have no scores yet' });
		}

		res.status(200).json({ scores });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};
