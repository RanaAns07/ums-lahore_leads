import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateOfferingDto } from './dto/create-offering.dto';
import { CourseOffering } from '@prisma/client';

/**
 * OfferingService manages course offerings
 */
@Injectable()
export class OfferingService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new course offering
     */
    async create(data: CreateOfferingDto): Promise<CourseOffering> {
        return this.prisma.courseOffering.create({
            data: {
                course_id: data.course_id,
                semester_id: data.semester_id,
                instructor_id: data.instructor_id,
                section_code: data.section_code,
                capacity: data.capacity,
            },
            include: {
                course: true,
                semester: true,
                instructor: true,
            },
        });
    }

    /**
     * Find offering by ID
     */
    async findById(id: string): Promise<CourseOffering | null> {
        return this.prisma.courseOffering.findUnique({
            where: { id },
            include: {
                course: true,
                semester: true,
                instructor: true,
            },
        });
    }

    /**
     * Find offering by ID or throw error
     */
    async findByIdOrFail(id: string): Promise<CourseOffering> {
        const offering = await this.findById(id);
        if (!offering) {
            throw new NotFoundException(`Course offering with ID ${id} not found`);
        }
        return offering;
    }

    /**
     * Find all offerings
     */
    async findAll(skip = 0, take = 50): Promise<CourseOffering[]> {
        return this.prisma.courseOffering.findMany({
            skip,
            take,
            include: {
                course: true,
                semester: true,
                instructor: true,
            },
            orderBy: [{ semester: { start_date: 'desc' } }, { course: { code: 'asc' } }],
        });
    }

    /**
     * Find offerings by semester
     */
    async findBySemester(semesterId: string): Promise<CourseOffering[]> {
        return this.prisma.courseOffering.findMany({
            where: { semester_id: semesterId },
            include: {
                course: true,
                instructor: true,
            },
            orderBy: { course: { code: 'asc' } },
        });
    }

    /**
     * Update offering instructor
     */
    async updateInstructor(
        id: string,
        instructorId: string | null,
    ): Promise<CourseOffering> {
        await this.findByIdOrFail(id);
        return this.prisma.courseOffering.update({
            where: { id },
            data: { instructor_id: instructorId },
            include: {
                course: true,
                semester: true,
                instructor: true,
            },
        });
    }

    /**
     * Delete offering
     */
    async delete(id: string): Promise<void> {
        await this.findByIdOrFail(id);
        await this.prisma.courseOffering.delete({
            where: { id },
        });
    }
}
