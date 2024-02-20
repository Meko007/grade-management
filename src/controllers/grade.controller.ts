import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createGrade = async (req: Request, res: Response) => {
    try {
        const { name, lowerLimit, upperLimit, gradePoint } = req.body;

        const parsedLowerLimit = Number(lowerLimit); 
        const parsedUpperLimit = Number(upperLimit);
        const parsedGp = Number(gradePoint);

        const gradeExists = await prisma.grade.findUnique({
            where: {
                name,
                lowerLimit: parsedLowerLimit,
                upperLimit: parsedUpperLimit, 
                gradePoint: parsedGp,
            }
        });
        
        if (gradeExists) {
            return res.status(409).json({ message: 'Grade exists already' });
        }

        if (name.length !== 1 || !(/[A-F]/g.test(name))) {
            return res.status(422).json({ message: 'only A, B, C, D, E, F are allowed' });
        }

        if (parsedLowerLimit >= parsedUpperLimit) {
            return res.status(422).json({ message: 'Lower limit must be less than the upper limit' });
        }

        if (parsedGp < 0 || parsedGp > 5) {
            return res.status(422).json({ message: 'GP is between 0-5' });
        }

        if (parsedLowerLimit < 0 || parsedLowerLimit > 70) {
            return res.status(422).json({ message: 'Lower limit must be between 0 and 70' });
        }

        if (parsedUpperLimit < 39 || parsedUpperLimit > 100 ) {
            return res.status(422).json({ message: 'upper limit starts from 39 and caps at 100' });
        }
        

        const newGrade = await prisma.grade.create({
            data: {
                name: name.toUpperCase(),
                lowerLimit: parsedLowerLimit,
                upperLimit: parsedUpperLimit, 
                gradePoint: parsedGp,
            }
        });
        res.status(201).json(newGrade);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getGrades = async (req: Request, res: Response) => {
    try {
        const grades = await prisma.grade.findMany();
        res.status(200).json(grades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getGradeById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const grade = await prisma.grade.findUnique({ where: { id: Number(id) } });

        if (!grade) {
            return res.status(404).json({ message: `Grade doesn't exist` });
        }

        res.status(200).json(grade);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateGrade = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, lowerLimit, upperLimit, gradePoint } = req.body;

        const parsedLowerLimit = Number(lowerLimit); 
        const parsedUpperLimit = Number(upperLimit);
        const parsedGp = Number(gradePoint);

        const grade = await prisma.grade.findUnique({ where: { id: Number(id) } });

        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        if (name && (name.length !== 1 || !(/[A-F]/g.test(name)))) {
            return res.status(422).json({ message: 'only A, B, C, D, E, F are allowed' });
        }

        if ((lowerLimit && upperLimit) && (parsedLowerLimit >= parsedUpperLimit)) {
            return res.status(422).json({ message: 'Lower limit must be less than the upper limit' });
        }

        if (gradePoint && (parsedGp < 0 || parsedGp > 5)) {
            return res.status(422).json({ message: 'GP is between 0-5' });
        }

        if (lowerLimit && (parsedLowerLimit < 0 || parsedLowerLimit > 70)) {
            return res.status(422).json({ message: 'Lower limit must be between 0 and 70' });
        }

        if (upperLimit && (parsedUpperLimit < 39 || parsedUpperLimit > 100)) {
            return res.status(422).json({ message: 'upper limit starts from 39 and caps at 100' });
        }
        
        const updatedGrade = await prisma.grade.update({
            where: { id: Number(id) },
            data: {
                name: name !== undefined ? name.toUpperCase() : undefined,
                lowerLimit: lowerLimit !== undefined ? parsedLowerLimit : undefined,
                upperLimit: upperLimit !== undefined ? parsedUpperLimit : undefined, 
                gradePoint: gradePoint !== undefined ? parsedGp : undefined
            },
        });

        res.status(200).json(updatedGrade);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const deleteGrade = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const grade = await prisma.grade.delete({ where: { id: Number(id) } });

        if (!grade) {
            return res.status(404).json({ message: 'grade not found' });
        }
        res.status(200).json({
            message: 'deleted',
            grade
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};