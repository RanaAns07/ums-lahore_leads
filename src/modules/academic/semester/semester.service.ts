import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { Semester } from '@prisma/client';

/**
 * SemesterService manages academic semesters
 * Enforces constraint: only one semester can be active at a time
 */
@Injectable()
export class SemesterService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new semester
     */
    async create(data: CreateSemesterDto): Promise<Semester> {
        // If creating as active, deactivate all others first
        if (data.is_active) {
            await this.deactivateAll();
        }

        return this.prisma.semester.create({
            data: {
                name: data.name,
                start_date: data.start_date,
                end_date: data.end_date,
                is_active: data.is_active ?? false,
            },
        });
    }

    /**
     * Find semester by ID
     */
    async findById(id: string): Promise<Semester | null> {
        return this.prisma.semester.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        offerings: true,
                    },
                },
            },
        });
    }

    /**
     * Find semester by ID or throw error
     */
    async findByIdOrFail(id: string): Promise<Semester> {
        const semester = await this.findById(id);
        if (!semester) {
            throw new NotFoundException(`Semester with ID ${id} not found`);
        }
        return semester;
    }

    /**
     * Find all semesters
     */
    async findAll(skip = 0, take = 50): Promise<Semester[]> {
        return this.prisma.semester.findMany({
            skip,
            take,
            include: {
                _count: {
                    select: {
                        offerings: true,
                    },
                },
            },
            orderBy: { start_date: 'desc' },
        });
    }

    /**
     * Get the currently active semester
     */
    async getActive(): Promise<Semester | null> {
        return this.prisma.semester.findFirst({
            where: { is_active: true },
        });
    }

    /**
     * Activate a semester (deactivates all others)
     */
    async activateSemester(id: string): Promise<Semester> {
        await this.findByIdOrFail(id);

        // Use transaction to ensure atomicity
        return this.prisma.$transaction(async (tx) => {
            // Deactivate all semesters
            await tx.semester.updateMany({
                where: { is_active: true },
                data: { is_active: false },
            });

            // Activate the specified semester
            return tx.semester.update({
                where: { id },
                data: { is_active: true },
            });
        });
    }

    /**
     * Deactivate all semesters
     */
    private async deactivateAll(): Promise<void> {
        await this.prisma.semester.updateMany({
            where: { is_active: true },
            data: { is_active: false },
        });
    }

    /**
     * Delete semester
     */
    async delete(id: string): Promise<void> {
        await this.findByIdOrFail(id);
        await this.prisma.semester.delete({
            where: { id },
        });
    }
}
