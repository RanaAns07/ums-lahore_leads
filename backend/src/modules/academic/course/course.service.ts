import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from '@prisma/client';

/**
 * CourseService manages courses with prerequisite validation
 */
@Injectable()
export class CourseService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new course
     */
    async create(data: CreateCourseDto): Promise<Course> {
        return this.prisma.course.create({
            data: {
                name: data.name,
                code: data.code,
                credit_hours: data.credit_hours,
                department_id: data.department_id,
            },
            include: {
                department: true,
            },
        });
    }

    /**
     * Find course by ID
     */
    async findById(id: string): Promise<Course | null> {
        return this.prisma.course.findUnique({
            where: { id },
            include: {
                department: true,
                prerequisites: {
                    include: {
                        prerequisite_course: true,
                    },
                },
                required_for: {
                    include: {
                        course: true,
                    },
                },
                _count: {
                    select: {
                        offerings: true,
                    },
                },
            },
        });
    }

    /**
     * Find course by ID or throw error
     */
    async findByIdOrFail(id: string): Promise<Course> {
        const course = await this.findById(id);
        if (!course) {
            throw new NotFoundException(`Course with ID ${id} not found`);
        }
        return course;
    }

    /**
     * Find all courses
     */
    async findAll(skip = 0, take = 50): Promise<Course[]> {
        return this.prisma.course.findMany({
            skip,
            take,
            include: {
                department: true,
                _count: {
                    select: {
                        prerequisites: true,
                        required_for: true,
                        offerings: true,
                    },
                },
            },
            orderBy: { code: 'asc' },
        });
    }

    /**
     * Add a prerequisite to a course
     * Validates that no circular dependency is created
     */
    async addPrerequisite(
        courseId: string,
        prerequisiteCourseId: string,
    ): Promise<void> {
        // Ensure both courses exist
        await this.findByIdOrFail(courseId);
        await this.findByIdOrFail(prerequisiteCourseId);

        // Prevent self-reference
        if (courseId === prerequisiteCourseId) {
            throw new BadRequestException('A course cannot be its own prerequisite');
        }

        // Check if prerequisite already exists
        const existing = await this.prisma.coursePrerequisite.findUnique({
            where: {
                course_id_prerequisite_course_id: {
                    course_id: courseId,
                    prerequisite_course_id: prerequisiteCourseId,
                },
            },
        });

        if (existing) {
            throw new ConflictException('This prerequisite relationship already exists');
        }

        // Check for circular dependency using DFS
        const wouldCreateCycle = await this.wouldCreateCycle(
            courseId,
            prerequisiteCourseId,
        );

        if (wouldCreateCycle) {
            throw new BadRequestException(
                'Adding this prerequisite would create a circular dependency',
            );
        }

        // Add the prerequisite
        await this.prisma.coursePrerequisite.create({
            data: {
                course_id: courseId,
                prerequisite_course_id: prerequisiteCourseId,
            },
        });
    }

    /**
     * Remove a prerequisite from a course
     */
    async removePrerequisite(
        courseId: string,
        prerequisiteCourseId: string,
    ): Promise<void> {
        await this.prisma.coursePrerequisite.delete({
            where: {
                course_id_prerequisite_course_id: {
                    course_id: courseId,
                    prerequisite_course_id: prerequisiteCourseId,
                },
            },
        });
    }

    /**
     * Delete course (with protection if offerings exist)
     */
    async delete(id: string): Promise<void> {
        const course = await this.findByIdOrFail(id);

        // Check if course has any offerings
        const offeringCount = await this.prisma.courseOffering.count({
            where: { course_id: id },
        });

        if (offeringCount > 0) {
            throw new ConflictException(
                `Cannot delete course with existing offerings. Found ${offeringCount} offering(s).`,
            );
        }

        await this.prisma.course.delete({
            where: { id },
        });
    }

    /**
     * Check if adding prerequisite B to course A would create a cycle
     * Uses Depth-First Search (DFS) to detect cycles
     * 
     * Algorithm: If A requires B, then B cannot require A (directly or transitively)
     * We check if prerequisiteCourseId has courseId in its prerequisite chain
     */
    private async wouldCreateCycle(
        courseId: string,
        prerequisiteCourseId: string,
    ): Promise<boolean> {
        // If prerequisiteCourseId (B) has courseId (A) as a prerequisite (directly or transitively),
        // then adding A->B would create a cycle
        return this.hasPrerequisite(prerequisiteCourseId, courseId, new Set());
    }

    /**
     * Depth-First Search to check if targetCourseId is a prerequisite
     * (direct or transitive) of sourceCourseId
     */
    private async hasPrerequisite(
        sourceCourseId: string,
        targetCourseId: string,
        visited: Set<string>,
    ): Promise<boolean> {
        // Prevent infinite loops
        if (visited.has(sourceCourseId)) {
            return false;
        }
        visited.add(sourceCourseId);

        // Get all prerequisites of the source course
        const prerequisites = await this.prisma.coursePrerequisite.findMany({
            where: { course_id: sourceCourseId },
            select: { prerequisite_course_id: true },
        });

        // Check each prerequisite
        for (const prereq of prerequisites) {
            // Direct match
            if (prereq.prerequisite_course_id === targetCourseId) {
                return true;
            }

            // Recursive check (transitive prerequisite)
            const hasTransitivePrereq = await this.hasPrerequisite(
                prereq.prerequisite_course_id,
                targetCourseId,
                visited,
            );

            if (hasTransitivePrereq) {
                return true;
            }
        }

        return false;
    }
}
