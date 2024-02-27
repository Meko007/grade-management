import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { isValidDeptId } from '../utils/util';

const prisma = new PrismaClient();

export const createDept = async (req: Request, res: Response) => {
	try {
		const { id, name, description, schoolId } = req.body;

		const deptExists = await prisma.dept.findUnique({ where: { id } });

		if (deptExists) {
			return res.status(409).json({ message: 'department exists already' });
		}

		if (!isValidDeptId(id)) {
			return res.status(422).json({ message: 'invalid department id' });
		} 

		const newDept = await prisma.dept.create({
			data: {
				id: id.toUpperCase(),
				name,
				description,
				school: { connect: { id: schoolId } },
			},
		});
		res.status(201).json(newDept);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getDepts = async (req: Request, res: Response) => {
	try {
		const { search, page = 1 } = req.query;
		const skip = (Number(page) - 1) * 10;

		const depts = await prisma.dept.findMany({
			where: {
				OR: search ? [
					{ name: { contains: (search as string), mode: 'insensitive' } },
				] : undefined,
			},
			skip,
			take: 10,
			orderBy: {
				id: 'asc'
			},
		});
		res.status(200).json(depts);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getDeptById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const dept = await prisma.dept.findUnique({ where: { id } });

		if (!dept) {
			return res.status(404).json({ message: 'Department not found' });
		}

		res.status(200).json(dept);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const updateDept = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { name, description, schoolId } = req.body;
		const dept = await prisma.dept.findUnique({ where: { id } });

		if (!dept) {
			return res.status(404).json({ message: 'Department not found' });
		}

		const updatedDept = await prisma.dept.update({
			where: { id },
			data: {
				name: name !== undefined ? name : undefined,
				description: description !== undefined ? description : undefined,
				school: schoolId !== undefined ? { connect: { id: schoolId } } : undefined,
			}
		});
		res.status(200).json(updatedDept);

	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const deleteDept = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const dept = await prisma.dept.delete({ where: { id } });

		if (!dept) {
			return res.status(404).json({ message: 'Department not found' });
		}

		res.status(200).json({
			message: 'deleted successfully',
			dept
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};