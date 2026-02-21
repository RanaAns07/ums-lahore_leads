import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from '@prisma/client';

/**
 * DepartmentService manages academic departments
 */
@Injectable()
export class DepartmentService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new department
     */
    async create(data: CreateDepartmentDto): Promise<Department> {
        return this.prisma.department.create({
            data: {
                name: data.name,
                code: data.code,
                head_of_dept_id: data.head_of_dept_id,
            },
            include: {
                head_of_dept: true,
            },
        });
    }

    /**
     * Find department by ID
     */
    async findById(id: string): Promise<Department | null> {
        return this.prisma.department.findUnique({
            where: { id },
            include: {
                head_of_dept: true,
                programs: true,
                courses: true,
            },
        });
    }

    /**
     * Find department by ID or throw error
     */
    async findByIdOrFail(id: string): Promise<Department> {
        const department = await this.findById(id);
        if (!department) {
            throw new NotFoundException(`Department with ID ${id} not found`);
        }
        return department;
    }

    /**
     * Find all departments
     */
    async findAll(skip = 0, take = 50): Promise<Department[]> {
        return this.prisma.department.findMany({
            skip,
            take,
            include: {
                head_of_dept: true,
                _count: {
                    select: {
                        programs: true,
                        courses: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    /**
     * Update department
     */
    async update(id: string, data: UpdateDepartmentDto): Promise<Department> {
        await this.findByIdOrFail(id);
        return this.prisma.department.update({
            where: { id },
            data,
            include: {
                head_of_dept: true,
            },
        });
    }

    /**
     * Delete department
     */
    async delete(id: string): Promise<void> {
        await this.findByIdOrFail(id);
        await this.prisma.department.delete({
            where: { id },
        });
    }
}
