import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createToken } from '../middleware/auth';
import { checkName, emailAddress, isEmail, random, transporter } from '../utils/util';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const userExists  = await prisma.admin.findUnique({ where: { email } });

        if (userExists) {
            return res.status(409).json({ message: `Admin with email (${email}) exists` });
        }

        if (checkName(firstName) || checkName(lastName)) {
            return res.status(422).json({ message: `Your name can't contain special characters or numbers besides "-"` });
        }

        if (!isEmail(email)) {
            return res.status(422).json({ message: 'Enter a valid email' });
        }
    
        const hash = await bcrypt.hash(password, 10);

        const newAdmin = await prisma.admin.create({
            data: {
                firstName,
                lastName,
                email,
                password: hash,
            },
        });
        res.status(201).json(newAdmin);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
    
        const admin = await prisma.admin.findUnique({ where: { email } });
    
        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        

        if (admin && (await bcrypt.compare(password, admin.password))) {
            const token = createToken(admin.id, admin.email, admin.role);
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

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { id, email } = req.body;
        const admin = await prisma.admin.findUnique({
            where: {
                id,
                email,
            },
        });

        if (!admin) {
            return res.status(404).json({ message: 'student not found' });
        }

        const resetToken = random(15);

        await prisma.admin.update({
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
            text: `Click on this link: http://localhost:5000/api/v1/admin/reset-password/${resetToken}`,
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
        const admin = await prisma.admin.findFirst({
            where: {
                resetToken,
            },
        });

        if (!admin) {
            return res.status(404).json({ message: 'page not found' });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        await prisma.admin.update({
            where: {
                id: admin.id 
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
