import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { isValidCourseCode, levelCheck } from '../utils/util';

const prisma = new PrismaClient();

export const createCourse = async (req: Request, res: Response) => {
	try {
		const { id, name, description, unit, deptId, semesterId } = req.body;

		const courseExists = await prisma.course.findUnique({ where: { id } });

		if (courseExists) {
			return res.status(409).json({ message: 'course exists already' });
		}

		if (!isValidCourseCode(id)) {
			return res.status(422).json({ message:  'invalid course code' });
		}
        
		const level = Number(id[4]) * 100;

		if (!levelCheck(Number(level))) {
			return res.status(422).json({ message: 'invalid level input' });
		}

		const dept = await prisma.dept.findUnique({ where: { id: deptId } });

		if (!dept) {
			return res.status(404).json({ message: 'department not found' });
		}

		const semester = await prisma.semester.findUnique({ where: { id: Number(semesterId) } });

		if (!semester) {
			return res.status(404).json({ message: 'semester not found' });
		}

		const newCourse = await prisma.course.create({
			data: {
				id: id.toUpperCase(),
				name,
				description,
				unit: Number(unit),
				level: Number(level),
				dept: { connect: { id: deptId } },
				semester: { connect: { id: Number(semesterId) } },
			},
		});
		res.status(201).json(newCourse);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getCourses = async (req: Request, res: Response) => {
	try {
		const { level, deptId, unit, semesterId } = req.query;
		const whereCondition: {
            level?: number,
            deptId?: string,
            unit?: number,
            semesterId?: number,
        } = {};

		if (level) {
			whereCondition.level = Number(level);
		}

		if (deptId) {
			whereCondition.deptId = deptId as string;
		}

		if (unit) {
			whereCondition.unit = Number(unit);
		}

		if (semesterId) {
			whereCondition.semesterId = Number(semesterId);
		}

		const courses = await prisma.course.findMany({
			where: whereCondition,
		});
		res.status(200).json(courses);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getCourseById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const course = await prisma.course.findUnique({ where: { id } });

		if (!course) {
			return res.status(404).json({ message: 'course not found' });
		}

		res.status(200).json(course);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const updateCourse = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { name, description, unit, level, deptId, semesterId } = req.body;

		const course = await prisma.course.findUnique({ where: { id } });

		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		if (level && !levelCheck(Number(level))) {
			return res.status(422).json({ message: 'invalid level input' });
		}
        
		const updatedCourse = await prisma.course.update({
			where: { id },
			data: {
				name: name !== undefined ? name : undefined,
				description: description !== undefined ? description : undefined,
				unit: unit !== undefined ? Number(unit) : undefined,
				level: level !== undefined ? Number(level) : undefined,
				dept: deptId !== undefined ? { connect: { id: deptId } } : undefined,
				semester: semesterId !== undefined ? { connect: { id: Number(semesterId) } } : undefined,
			},
		});
		res.status(200).json(updatedCourse);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const deleteCourse = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const course = await prisma.course.delete({ where: { id } });

		if (!course) {
			return res.status(404).json({ message: 'student not found' });
		}
		res.status(200).json({
			message: 'deleted',
			course
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};