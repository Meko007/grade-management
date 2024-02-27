import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createToken, customReq } from '../middleware/auth';
import {
	capitalizeName, 
	checkName, 
	emailAddress, 
	isEmail, 
	random, 
	transporter 
} from '../utils/util';
import { calculateGPA } from '../utils/gpaCalc';
import { JwtPayload } from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
	try {
		const { firstName, lastName, email, password } = req.body;

		const userExists  = await prisma.lecturer.findUnique({ where: { email } });

		if (userExists) {
			return res.status(409).json({ message: `Lecturer with email (${email}) exists` });
		}
    
		if (!isEmail(email)) {
			return res.status(422).json({ message: 'Enter a valid email' });
		}

		if (checkName(firstName) || checkName(lastName)) {
			return res.status(422).json({ message: 'Your name can\'t contain special characters or numbers besides "-"' });
		}

		const hash = await bcrypt.hash(password, 10);

		const newLect = await prisma.lecturer.create({
			data: {
				firstName: capitalizeName(firstName),
				lastName: capitalizeName(lastName),
				email,
				password: hash
			},
		});
		res.status(201).json(newLect);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
    
		const lecturer = await prisma.lecturer.findUnique({ where: { email } });
    
		if (!lecturer) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}
        
		if (lecturer && (await bcrypt.compare(password, lecturer.password))) {
			const token = createToken(lecturer.id, lecturer.email, lecturer.role);
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

export const getLecturers = async (req: Request, res: Response) => {
	try {
		const { search, page = 1 } = req.query;

		const skip = (Number(page) - 1) * 10;

		const lecturers = await prisma.lecturer.findMany({
			where: {
				OR: search ? [
					{
						AND: [
							{ firstName: { contains: (search as string).split(' ')[0], mode: 'insensitive' } },
							{ lastName: { contains: (search as string).split(' ')[1], mode: 'insensitive' } },
						],
					},
					{
						AND: [
							{ firstName: { contains: (search as string).split(' ')[1], mode: 'insensitive' } },
							{ lastName: { contains: (search as string).split(' ')[0], mode: 'insensitive' } },
						],
					},
				] : undefined,
			},
			skip: skip,
			take: 10,
			orderBy: {
				firstName: 'asc',
			},
		});
		res.status(200).json(lecturers);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getLecturerById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const lecturer = await prisma.lecturer.findUnique({ where: { id: Number(id) } });

		if (!lecturer) {
			return res.status(404).json({ message: 'lecturer not found' });
		}

		res.status(200).json(lecturer);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const updateLecturer = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { courseIds, deptIds } = req.body;

		const lecturerExists = await prisma.lecturer.findUnique({ where: { id: Number(id) } });

		if (!lecturerExists) {
			return res.status(404).json({ message: 'lecturer not found' });
		}

		await prisma.lecturer.update({
			where: { id: Number(id) },
			data: {
				courses: {
					set: courseIds?.map((id: string) => ({ id }))
				},
				depts: {
					set: deptIds?.map((id: string) => ({ id }))
				},
			},
		});
		res.status(200).json({ message: 'updated successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const deleteLecturer = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const lecturer = await prisma.lecturer.delete({ where: { id: Number(id) } });

		if (!lecturer) {
			return res.status(404).json({ message: 'lecturer not found' });
		}
		res.status(200).json({
			message: 'deleted',
			lecturer
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { id, email } = req.body;
		const lecturer = await prisma.lecturer.findUnique({
			where: {
				id,
				email,
			},
		});

		if (!lecturer) {
			return res.status(404).json({ message: 'student not found' });
		}

		const resetToken = random(10);

		await prisma.lecturer.update({
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
			subject: 'Password Reset Token',
			text: `Click on this link: http://localhost:5000/api/v1/lecturers/reset-password/${resetToken}`,
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
		const lecturer = await prisma.lecturer.findFirst({
			where: {
				resetToken,
			},
		});

		if (!lecturer) {
			return res.status(404).json({ message: 'page not found' });
		}

		const hash = await bcrypt.hash(newPassword, 10);

		await prisma.lecturer.update({
			where: {
				id: lecturer.id 
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

export const getCourses = async (req: Request, res: Response) => {
	try {
		const { id } = (req as customReq).token as JwtPayload;
		const { page = 1, search } = req.query;

		const skip = (Number(page) - 1) * 10;

		const courses = await prisma.course.findMany({
			where: {
				lecturers: { some: { id: Number(id) } },
				AND: search ? [
					{ name: { contains: (search as string), mode: 'insensitive' } },
				] : undefined,
			},
			skip: skip,
			take: 10,
			orderBy: {
				name: 'asc',
			},
		});
		res.status(200).json(courses);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const scoreStudent = async (req: Request, res: Response) => {
	try {
		const lecturerId = ((req as customReq).token as JwtPayload).id; 
		const { sessionId, semesterId } = req.params;
		const { studentId, courseId, scoreValue } = req.body;

		const lecturer = await prisma.lecturer.findUnique({
			where: {
				id: lecturerId,
			},
			include: {
				depts: true,
				courses: true,
			}
		});

		const student = await prisma.student.findUnique({
			where: {
				id: studentId,
			},
			include: {
				dept: true,
				courses: true,
			},
		});

		const course = await prisma.course.findUnique({
			where: {
				id: courseId,
			},
			include: {
				dept: true,
			},
		});

		if (!student?.courses.includes(courseId)) {
			return res.status(400).json({ message: 'student isn\'t registered for this course' });
		}

		if (!lecturer?.depts.find(dept => dept.id === student?.deptId) ||
            !lecturer?.depts.find(dept => dept.id === course?.deptId)
		) {
			return res.status(403).json({ message: 'Not authorized to grade this student' });
		}

		if (!lecturer?.courses.find(course => course.id === courseId)) {
			return res.status(403).json({ message: 'Not authorized to grade this student' });
		}

		const rightSemester = await prisma.course.findFirst({
			where: {
				id: courseId,
				semesterId: Number(semesterId)
			}
		});

		if (!rightSemester) {
			return res.status(403).json({ message: 'Wrong semester for this course' });
		}

		const gradedBefore = await prisma.score.findFirst({
			where: {
				studentId,
				courseId
			},
		});

		if (gradedBefore) {
			return res.status(409).json({ message: 'You have graded this student on this course' });
		}

		const grade = await prisma.grade.findFirst({
			where: {
				lowerLimit: { lte: Number(scoreValue) },
				upperLimit: { gte: Number(scoreValue) },
			},
		});

		if (Number(scoreValue) < 0 || Number(scoreValue) > 100) {
			return res.status(422).json({ message: 'invalid score' });
		}

		const score = await prisma.score.create({
			data: {
				student: { connect: { id: studentId } },
				course: { connect: { id: courseId } },
				session: { connect: { id: sessionId }},
				semester: { connect: { id: Number(semesterId) } },
				lecturer: { connect: { id: Number(lecturerId) } },
				grade: { connect: { id: grade?.id } },
				score: Number(scoreValue),
			},
		});

		const gpa = await calculateGPA(studentId, sessionId, Number(semesterId));

		const existingGPA = await prisma.gPA.findFirst({
			where: {
				studentId: studentId,
				sessionId: sessionId,
				semesterId: Number(semesterId),
			},
		});

		if (existingGPA) {
			await prisma.gPA.update({
				where: {
					id: existingGPA.id
				},
				data: {
					value: gpa,
				},
			});
		} else {
			await prisma.gPA.create({
				data: {
					student: { connect: { id: studentId } },
					session: { connect: { id: sessionId } },
					semester: { connect: { id: Number(semesterId) } },
					value: gpa,
				},
			});
		}
		res.status(201).json({ message: 'student scored successfully', score });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const updateStudentScore = async (req: Request, res: Response) => {
	try {
		const lecturerId = ((req as customReq).token as JwtPayload).id; 
		const { sessionId, semesterId } = req.params;
		const { studentId, courseId, scoreValue } = req.body;

		const lecturer = await prisma.lecturer.findUnique({
			where: {
				id: lecturerId,
			},
			include: {
				depts: true,
				courses: true,
			}
		});

		const student = await prisma.student.findUnique({
			where: {
				id: studentId,
			},
			include: {
				dept: true,
			},
		});

		const course = await prisma.course.findUnique({
			where: {
				id: courseId,
			},
			include: {
				dept: true,
			},
		});

		if (!lecturer?.depts.find(dept => dept.id === student?.deptId) &&
            !lecturer?.depts.find(dept => dept.id === course?.deptId)
		) {
			return res.status(403).json({ message: 'not authorized to update scores for this student' });
		}

		if (!lecturer?.courses.find(course => course.id === courseId)) {
			return res.status(403).json({ message: 'not authorized to update scores for this student' });
		}

		const rightSemester = await prisma.course.findFirst({
			where: {
				id: courseId,
				semesterId: Number(semesterId)
			}
		});

		if (!rightSemester) {
			return res.status(403).json({ message: 'wrong semester for this course' });
		}

		const existingScore = await prisma.score.findFirst({
			where: {
				studentId,
				courseId,
				sessionId,
				semesterId: Number(semesterId),
			},
		});

		if (!existingScore) {
			return res.status(404).json({ message: 'no score found for the specified parameters' });
		}

		if (Number(scoreValue) < 0 || Number(scoreValue) > 100) {
			return res.status(422).json({ message: 'invalid score' });
		}

		const grade = await prisma.grade.findFirst({
			where: {
				lowerLimit: { lte: Number(scoreValue) },
				upperLimit: { gte: Number(scoreValue) },
			},
		});

		const updatedScore = await prisma.score.update({
			where: {
				id: existingScore.id,
			},
			data: {
				grade: { connect: { id: grade?.id } },
				score: Number(scoreValue),
			},
		});

		const gpa = await calculateGPA(studentId, sessionId, Number(semesterId));

		const existingGPA = await prisma.gPA.findFirst({
			where: {
				studentId: studentId,
				sessionId: sessionId,
				semesterId: Number(semesterId),
			},
		});

		if (existingGPA) {
			await prisma.gPA.update({
				where: {
					id: existingGPA.id
				},
				data: {
					value: gpa,
				},
			});
		} else {
			await prisma.gPA.create({
				data: {
					student: { connect: { id: studentId } },
					session: { connect: { id: sessionId } },
					semester: { connect: { id: Number(semesterId) } },
					value: gpa,
				},
			});
		}

		res.status(200).json({ message: 'student score updated successfully', updatedScore });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const viewGrades = async (req: Request, res: Response) => {
	try {
		const { id } = (req as customReq).token as JwtPayload;

		const scores = await prisma.lecturer.findMany({
			where: { id },
			include: {
				courses: true,
				scores: true,
			},
		});
		res.status(200).json(scores);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};