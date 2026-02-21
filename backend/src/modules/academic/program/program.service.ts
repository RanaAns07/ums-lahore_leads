import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { Program } from '@prisma/client';

/**
 * ProgramService manages academic programs
 */
@Injectable()
export class ProgramService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new program
     */
    async create(data: CreateProgramDto): Promise<Program> {
        return this.prisma.program.create({
            data: {
                name: data.name,
                code: data.code,
                duration_semesters: data.duration_semesters,
                department_id: data.department_id,
            },
            include: {
                department: true,
            },
        });
    }

    /**
     * Find program by ID
     */
    async findById(id: string): Promise<Program | null> {
        return this.prisma.program.findUnique({
            where: { id },
            include: {
                department: true,
            },
        });
    }

    /**
     * Find program by ID or throw error
     */
    async findByIdOrFail(id: string): Promise<Program> {
        const program = await this.findById(id);
        if (!program) {
            throw new NotFoundException(`Program with ID ${id} not found`);
        }
        return program;
    }

    /**
     * Find all programs
     */
    async findAll(skip = 0, take = 50): Promise<Program[]> {
        return this.prisma.program.findMany({
            skip,
            take,
            include: {
                department: true,
            },
            orderBy: { name: 'asc' },
        });
    }

    /**
     * Delete program
     */
    async delete(id: string): Promise<void> {
        await this.findByIdOrFail(id);
        await this.prisma.program.delete({
            where: { id },
        });
    }
}
