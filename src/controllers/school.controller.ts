import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { isValidDeptId } from '../utils/util';

const prisma = new PrismaClient();

export const createSchool = async (req: Request, res: Response) => {
    try {
        const { id, name, description } = req.body;
        const schoolExists = await prisma.school.findUnique({ where: { id } });

        if (schoolExists) {
            return res.status(409).json({ message: 'school already exists' });
        }

        if (!isValidDeptId(id)) {
            return res.status(422).json({ message: 'invalid id input' });
        }

        const newSchool = await prisma.school.create({
            data: {
                id: id.toUpperCase(),
                name,
                description,
            },
        });
        res.status(201).json(newSchool);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getSchools = async (req: Request, res: Response) => {
    try {
        const schools = await prisma.school.findMany();
        res.status(200).json(schools);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getSchoolById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const school = await prisma.school.findUnique({ where: { id } });

        if (!school) {
            return res.status(404).json({ message: 'school not found' });
        }

        res.status(200).json(school);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateSchool = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const school = await prisma.school.findUnique({ where: { id } });

        if (!school) {
        return res.status(404).json({ message: 'school not found' });
        }

        const updatedSchool = await prisma.school.update({
            where: { id },
            data: {
                name: name !== undefined ? name : undefined,
                description: description !== undefined ? description: undefined,
            },
        });
        res.status(200).json(updatedSchool);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const deleteSchool = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const school = await prisma.school.delete({ where: { id } });

        if (!school) {
            return res.status(404).json({ message: "school not found" });
        }

        res.status(200).json({
            message: 'deleted successfully',
            school
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getDepts = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const depts = await prisma.school.findMany({
            where: { id },
            include: {
                departments: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        res.status(200).json(depts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};