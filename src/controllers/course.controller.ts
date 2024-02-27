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

		if (!([1, 2, 3, 4, 5, 6].includes(Number(unit)))) {
			return res.status(422).json({ message: 'invalid unit input' });
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
		const { level, deptId, unit, semesterId, search, page = 1 } = req.query;
		const skip = (Number(page) - 1) * 10;

		const courses = await prisma.course.findMany({
			where: {
				level: level ? Number(level) : undefined,
				deptId: deptId ? deptId as string : undefined,
				unit: unit ? Number(unit) : undefined,
				semesterId: semesterId ? Number(semesterId) : undefined,
				OR: search ? [
					{ name: { contains: (search as string), mode: 'insensitive' } },
				] : undefined,
			},
			skip: skip,
			take: 10,
			orderBy: {
				id: 'asc',
			},
		});
		console.log(search);
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

		if (!([1, 2, 3, 4, 5, 6].includes(Number(unit)))) {
			return res.status(422).json({ message: 'invalid unit input' });
		}
        
		const updatedCourse = await prisma.course.update({
			where: { id },
			data: {
				name: name ? name : undefined,
				description: description ? description : undefined,
				unit: unit ? Number(unit) : undefined,
				level: level ? Number(level) : undefined,
				dept: deptId ? { connect: { id: deptId } } : undefined,
				semester: semesterId ? { connect: { id: Number(semesterId) } } : undefined,
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