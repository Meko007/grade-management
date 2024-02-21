import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSession = async (req: Request, res: Response) => {
	try {
		const { id, name } = req.body;
		const sessionExists = await prisma.session.findUnique({ where: { id } });

		if (sessionExists) {
			return res.status(409).json({ message: 'session exists already' });
		}

		if (!((/^\d{4}.\d{4}$/).test(id))) {
			return res.status(422).json({ message: 'invalid id input' });
		}

		const newSession = await prisma.session.create({
			data: {
				id,
				name,
				semesters: {
					connect: [
						{ id: 1 },
						{ id: 2 },
					],
				},
			},
			include: { semesters: true },
		});
		res.status(201).json(newSession);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getSessions = async (req: Request, res: Response) => {
	try {
		const sessions = await prisma.session.findMany({ include: { semesters: true } });
		res.status(200).json(sessions);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const getSessionById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const session = await prisma.session.findUnique({
			where: { id },
			include: { semesters: true } 
		});

		if (!session) {
			return res.status(404).json({ message: 'session not found' });
		}

		res.status(200).json(session);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export const deleteSession = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const session = await prisma.session.delete({ where: { id } });

		if (!session) {
			return res.status(404).json({ message: 'session not found' });
		}

		res.status(200).json({
			message: 'deleted successfully',
			session
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};