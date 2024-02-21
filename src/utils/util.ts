import nodemailer from 'nodemailer';
import 'dotenv/config';

export const random = (length: number): string => {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
};

export const isEmail = (email: string): boolean => 
	(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email);

export const checkName = (name: string): boolean => 
	(/[\d!@#$%^&*()_+={}[\]:;<>,.?~\\\/]+/).test(name); // Checking if a name contains stuff besides letters

export const capitalizeName = (name: string): string => {
	return name
		.split(/\s+/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
};

// Sanitize text inputs
export const sanitizeText = (text: string): boolean => /^[A-Za-z]+$/.test(text); //Checking if it the text contains non-alphabets

// Level check
export const levelCheck = (level: number): boolean =>  
	Number.isInteger(level) && [100, 200, 300, 400, 500, 600].includes(level);

// Checking valid department ids and course codes
export const isValidCourseCode = (courseCode: string): boolean => 
	(/^[A-Z]{4}\d{3}$/).test(courseCode); 

export const isValidDeptId = (deptId: string): boolean => (/^[A-Z]{4}$/).test(deptId);


// NODEMAILER
export const emailAddress = process.env.EMAIL as string;
const emailPassword = process.env.EMAIL_PASS as string;

export const transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: emailAddress,
		pass: emailPassword,
	},
});