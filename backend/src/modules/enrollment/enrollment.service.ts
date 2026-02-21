import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Inject,
    forwardRef,
} from '@nestjs/common';
import {
    StudentProfile,
    Enrollment,
    CourseRegistration,
    EnrollmentStatus,
} from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { ApplicationService } from '../admissions/application/application.service';
import { StudentIdGenerator } from './utils/student-id.generator';

/**
 * EnrollmentService manages student enrollment and course registration
 * 
 * Key responsibilities:
 * - Provision students from accepted applications
 * - Manage enrollment status lifecycle
 * - Handle course registration with validation
 */
@Injectable()
export class EnrollmentService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => ApplicationService))
        private applicationService: ApplicationService,
        private studentIdGenerator: StudentIdGenerator,
    ) { }

    /**
     * Provision student from ACCEPTED application
     * 
     * TRANSACTIONAL LOGIC:
     * 1. Verify application is ACCEPTED
     * 2. Generate unique student ID (YYYY-DEPT-XXXX format)
     * 3. Create StudentProfile
     * 4. Create Enrollment record
     * 
     * @returns StudentProfile and Enrollment records
     */
    async provisionStudent(applicationId: string): Promise<{
        studentProfile: StudentProfile;
        enrollment: Enrollment;
    }> {
        // 1. Verify application is ACCEPTED
        const application = await this.applicationService.findByIdOrFail(
            applicationId,
        );

        if (application.status !== 'ACCEPTED') {
            throw new ConflictException(
                `Only ACCEPTED applications can be provisioned. Current status: ${application.status}`,
            );
        }

        // 2. Check if student already provisioned
        const existingStudent = await this.prisma.studentProfile.findUnique({
            where: { person_id: application.person_id },
        });

        if (existingStudent) {
            throw new ConflictException(
                `Student already provisioned with ID: ${existingStudent.student_id_number}`,
            );
        }

        // 3. Execute provisioning in transaction
        return this.prisma.$transaction(async (tx) => {
            // Get program with department for ID generation
            const program = await tx.program.findUnique({
                where: { id: application.program_id },
                include: { department: true },
            });

            if (!program) {
                throw new NotFoundException(
                    `Program ${application.program_id} not found`,
                );
            }

            // Generate unique student ID
            const studentId = await this.studentIdGenerator.generate(
                program.department.code,
            );

            // Create StudentProfile
            const studentProfile = await tx.studentProfile.create({
                data: {
                    person_id: application.person_id,
                    student_id_number: studentId,
                    status: 'PROVISIONED',
                },
                include: {
                    person: true,
                },
            });

            // Get current active semester for enrollment
            const activeSemester = await tx.semester.findFirst({
                where: { is_active: true },
            });

            if (!activeSemester) {
                throw new ConflictException(
                    'No active semester found. Please set an active semester first.',
                );
            }

            // Create Enrollment
            const enrollment = await tx.enrollment.create({
                data: {
                    student_profile_id: studentProfile.id,
                    program_id: application.program_id,
                    batch_id: application.batch_id,
                    semester_id: activeSemester.id,
                    status: 'PROVISIONED',
                },
                include: {
                    student_profile: {
                        include: {
                            person: true,
                        },
                    },
                    program: {
                        include: {
                            department: true,
                        },
                    },
                    semester: true,
                },
            });

            console.log(
                `🎓 Student provisioned: ${studentProfile.student_id_number} (${studentProfile.person.legal_name})`,
            );

            return { studentProfile, enrollment };
        });
    }

    /**
     * Activate enrollment (move from PROVISIONED to ACTIVE)
     * Called after payment/documentation is complete
     */
    async activateEnrollment(enrollmentId: string): Promise<Enrollment> {
        const enrollment = await this.findByIdOrFail(enrollmentId);

        if (enrollment.status === 'ACTIVE') {
            return enrollment; // Already active
        }

        if (enrollment.status !== 'PROVISIONED') {
            throw new ConflictException(
                `Cannot activate enrollment. Current status: ${enrollment.status}`,
            );
        }

        // Update both StudentProfile and Enrollment status
        return this.prisma.$transaction(async (tx) => {
            // Update StudentProfile
            await tx.studentProfile.update({
                where: { id: enrollment.student_profile_id },
                data: { status: 'ACTIVE' },
            });

            // Update Enrollment
            const updated = await tx.enrollment.update({
                where: { id: enrollmentId },
                data: { status: 'ACTIVE' },
                include: {
                    student_profile: true,
                    program: true,
                    semester: true,
                },
            });

            console.log(
                `✅ Enrollment activated: ${updated.student_profile.student_id_number}`,
            );

            return updated;
        });
    }

    /**
     * Register student for courses with comprehensive validation
     * 
     * Validations:
     * 1. Enrollment must be ACTIVE
     * 2. Course offering capacity not exceeded
     * 3. Prerequisites completed
     * 4. No duplicate registrations
     */
    async registerForCourses(
        enrollmentId: string,
        offeringIds: string[],
    ): Promise<CourseRegistration[]> {
        const enrollment = await this.findByIdOrFail(enrollmentId);

        // 1. Validate enrollment status
        if (enrollment.status === 'WITHDRAWN' || enrollment.status === 'ON_HOLD') {
            throw new ConflictException(
                `Cannot register. Enrollment status: ${enrollment.status}`,
            );
        }

        if (enrollment.status !== 'ACTIVE') {
            throw new BadRequestException(
                'Enrollment must be ACTIVE to register for courses',
            );
        }

        const registrations: CourseRegistration[] = [];

        // Process each offering
        for (const offeringId of offeringIds) {
            const offering = await this.prisma.courseOffering.findUnique({
                where: { id: offeringId },
                include: {
                    course: {
                        include: {
                            prerequisites: {
                                include: {
                                    prerequisite_course: true,
                                },
                            },
                        },
                    },
                    instructor: true,
                    semester: true,
                },
            });

            if (!offering) {
                throw new NotFoundException(`Course offering ${offeringId} not found`);
            }

            // 2. Check if already registered
            const existingReg = await this.prisma.courseRegistration.findUnique({
                where: {
                    enrollment_id_course_offering_id: {
                        enrollment_id: enrollmentId,
                        course_offering_id: offeringId,
                    },
                },
            });

            if (existingReg) {
                throw new ConflictException(
                    `Already registered for ${offering.course.code}`,
                );
            }

            // 3. Check capacity
            const currentCount = await this.prisma.courseRegistration.count({
                where: {
                    course_offering_id: offeringId,
                    status: 'REGISTERED',
                },
            });

            if (currentCount >= offering.capacity) {
                throw new ConflictException(
                    `Course ${offering.course.code} is full (${currentCount}/${offering.capacity})`,
                );
            }

            // 4. Validate prerequisites
            if (offering.course.prerequisites.length > 0) {
                await this.validatePrerequisites(enrollmentId, offering.course);
            }

            // 5. Create registration
            const registration = await this.prisma.courseRegistration.create({
                data: {
                    enrollment_id: enrollmentId,
                    course_offering_id: offeringId,
                    status: 'REGISTERED',
                },
                include: {
                    course_offering: {
                        include: {
                            course: true,
                            semester: true,
                        },
                    },
                },
            });

            registrations.push(registration);

            console.log(
                `📚 Registered: ${(enrollment as any).student_profile.student_id_number} → ${offering.course.code}`,
            );
        }

        return registrations;
    }

    /**
     * Validate that student has completed all prerequisites for a course
     */
    private async validatePrerequisites(
        enrollmentId: string,
        course: any,
    ): Promise<void> {
        for (const prereq of course.prerequisites) {
            const completed = await this.prisma.courseRegistration.findFirst({
                where: {
                    enrollment_id: enrollmentId,
                    course_offering: {
                        course_id: prereq.prerequisite_course_id,
                    },
                    status: 'COMPLETED',
                },
            });

            if (!completed) {
                throw new BadRequestException(
                    `Prerequisite not met: ${prereq.prerequisite_course.code} - ${prereq.prerequisite_course.name}`,
                );
            }
        }
    }

    /**
     * Get enrollment by ID or throw NotFoundException
     */
    async findByIdOrFail(id: string): Promise<Enrollment> {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id },
            include: {
                student_profile: {
                    include: {
                        person: true,
                    },
                },
                program: {
                    include: {
                        department: true,
                    },
                },
                semester: true,
                registrations: {
                    include: {
                        course_offering: {
                            include: {
                                course: true,
                                semester: true,
                            },
                        },
                    },
                },
            },
        });

        if (!enrollment) {
            throw new NotFoundException(`Enrollment with ID ${id} not found`);
        }

        return enrollment;
    }

    /**
     * Find all enrollments with optional filters
     */
    async findAll(
        status?: EnrollmentStatus,
        programId?: string,
    ): Promise<Enrollment[]> {
        return this.prisma.enrollment.findMany({
            where: {
                ...(status && { status }),
                ...(programId && { program_id: programId }),
            },
            include: {
                student_profile: {
                    include: {
                        person: true,
                    },
                },
                program: true,
                semester: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }

    /**
     * Get enrollment by student profile ID
     */
    async findByStudentProfileId(studentProfileId: string): Promise<Enrollment[]> {
        return this.prisma.enrollment.findMany({
            where: { student_profile_id: studentProfileId },
            include: {
                program: true,
                semester: true,
                registrations: {
                    include: {
                        course_offering: {
                            include: {
                                course: true,
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Update enrollment status
     */
    async updateStatus(
        enrollmentId: string,
        newStatus: EnrollmentStatus,
    ): Promise<Enrollment> {
        const enrollment = await this.findByIdOrFail(enrollmentId);

        // Update both StudentProfile and Enrollment
        return this.prisma.$transaction(async (tx) => {
            await tx.studentProfile.update({
                where: { id: enrollment.student_profile_id },
                data: { status: newStatus },
            });

            return tx.enrollment.update({
                where: { id: enrollmentId },
                data: { status: newStatus },
                include: {
                    student_profile: true,
                    program: true,
                },
            });
        });
    }
}
