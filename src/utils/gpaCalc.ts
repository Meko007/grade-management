import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const calculateGPA = async (studentId: string, sessionId: string, semesterId: number): Promise<number> => {
    const scores = await prisma.score.findMany({
      where: {
        studentId: studentId,
        sessionId: sessionId,
        semesterId: semesterId,
      },
      include: {
        grade: {
            select: {
                gradePoint: true
            },
        },
        course: {
            select: {
                unit: true,
            },
        },
      },
    });
  
    if (scores.length === 0) {
      return 0;
    }
  
    const totalGradePoints = scores.reduce((sum, score) => {
      return sum + (score.grade?.gradePoint || 0) * score.course.unit;
    }, 0);
  
    const totalUnits = scores.reduce((sum, score) => sum + score.course.unit, 0);
  
    const calculatedGPA = totalGradePoints / totalUnits;
  
    return calculatedGPA;
};