import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSemester = async (req: Request, res: Response) => {
	try {
		const { id, name } = req.body;
		const semesterExists = await prisma.semester.findUnique({ where: { id } });

		if (semesterExists) {
			return res.status(409).json({ message: 'semester exists already' });
		}

		if (!([1, 2].includes(Number(id)))) {
			return res.status(422).json({ message: 'invalid id input' });
		}

		const newSemester = await prisma.semester.create({
			data: {
				id: Number(id),
				name
			}
		});
		res.status(201).json(newSemester);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getSemesters = async (req: Request, res: Response) => {
	try {
		const semesters = await prisma.semester.findMany();
		res.status(200).json(semesters);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getSemesterById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const semester = await prisma.semester.findUnique({ where: { id: Number(id) } });

		if (!semester) {
			return res.status(404).json({ message: 'semester not found' });
		}

		res.status(200).json(semester);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const deleteSemester = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const semester = await prisma.semester.delete({ where: { id: Number(id) } });

		if (!semester) {
			return res.status(404).json({ message: 'semester not found' });
		}

		res.status(200).json({
			message: 'deleted successfully',
			semester
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};