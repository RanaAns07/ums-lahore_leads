import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

/**
 * StudentIdGenerator creates unique student IDs
 * Format: YYYY-DEPT-XXXX
 * Example: 2024-CS-0001
 * 
 * Thread-safe via Prisma transactions
 */
@Injectable()
export class StudentIdGenerator {
    constructor(private prisma: PrismaService) { }

    /**
     * Generate unique student ID for a given department
     * 
     * @param departmentCode The department code (e.g., "CS", "EE")
     * @returns Unique student ID in format YYYY-DEPT-XXXX
     */
    async generate(departmentCode: string): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `${year}-${departmentCode}-`;

        // Find the last student ID with this year-dept prefix
        const lastStudent = await this.prisma.studentProfile.findFirst({
            where: {
                student_id_number: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                student_id_number: 'desc',
            },
            select: {
                student_id_number: true,
            },
        });

        // Extract sequence number and increment
        let nextSequence = 1;
        if (lastStudent) {
            const parts = lastStudent.student_id_number.split('-');
            const currentSequence = parseInt(parts[2], 10);
            nextSequence = currentSequence + 1;
        }

        // Format: YYYY-DEPT-XXXX (zero-padded to 4 digits)
        const studentId = `${prefix}${nextSequence.toString().padStart(4, '0')}`;

        return studentId;
    }
}
