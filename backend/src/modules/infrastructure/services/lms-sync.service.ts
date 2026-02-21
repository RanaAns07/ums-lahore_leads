import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma.service';

/**
 * LmsSyncService syncs student and course data to external LMS
 * 
 * Supports: Moodle, Canvas
 * Provisions students when enrollment is ACTIVE
 */
@Injectable()
export class LmsSyncService {
    private readonly lmsProvider: string;
    private readonly lmsApiUrl: string;
    private readonly lmsApiKey: string;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        this.lmsProvider = this.configService.get('LMS_PROVIDER', 'none');
        this.lmsApiUrl = this.configService.get('LMS_API_URL', '');
        this.lmsApiKey = this.configService.get('LMS_API_KEY', '');
    }

    /**
     * Provision student to LMS when enrollment is activated
     * 
     * @param enrollmentId Enrollment ID to sync
     */
    async provisionStudent(enrollmentId: string): Promise<void> {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
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
                registrations: {
                    include: {
                        course_offering: {
                            include: {
                                course: true,
                                semester: true,
                            },
                        },
                    },
                    where: {
                        status: 'REGISTERED',
                    },
                },
            },
        });

        if (!enrollment) {
            throw new Error(`Enrollment ${enrollmentId} not found`);
        }

        if (enrollment.status !== 'ACTIVE') {
            console.log(`⏭️ [LMS] Skipping provision: Enrollment not ACTIVE`);
            return;
        }

        // Create student user in LMS
        await this.createLmsUser(enrollment);

        // Enroll in courses
        for (const registration of enrollment.registrations) {
            await this.enrollInLmsCourse(enrollment, registration.course_offering);
        }
    }

    /**
     * Sync course offering to LMS
     * Creates course in LMS if doesn't exist
     */
    async syncCourseOffering(courseOfferingId: string): Promise<void> {
        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: courseOfferingId },
            include: {
                course: true,
                semester: true,
                instructor: true,
            },
        });

        if (!offering) {
            throw new Error(`CourseOffering ${courseOfferingId} not found`);
        }

        if (this.lmsProvider === 'moodle') {
            await this.createMoodleCourse(offering);
        } else if (this.lmsProvider === 'canvas') {
            await this.createCanvasCourse(offering);
        } else {
            this.logCourseSync(offering);
        }
    }

    /**
     * Sync all active registrations for an enrollment
     */
    async syncEnrollmentCourses(enrollmentId: string): Promise<void> {
        const registrations = await this.prisma.courseRegistration.findMany({
            where: {
                enrollment_id: enrollmentId,
                status: 'REGISTERED',
            },
            include: {
                course_offering: {
                    include: {
                        course: true,
                    },
                },
                enrollment: {
                    include: {
                        student_profile: true,
                    },
                },
            },
        });

        for (const registration of registrations) {
            await this.enrollInLmsCourse(
                registration.enrollment as any,
                registration.course_offering,
            );
        }
    }

    // ============================================
    // LMS User Management
    // ============================================

    private async createLmsUser(enrollment: any): Promise<void> {
        const student = enrollment.student_profile;
        const person = student.person;

        const userData = {
            username: student.student_id_number,
            firstname: person.legal_name.split(' ')[0],
            lastname: person.legal_name.split(' ').slice(1).join(' ') || 'Student',
            email: `${student.student_id_number}@ums.edu`, // Generate from student ID
            auth: 'manual', // Or 'oauth2', 'ldap'
        };

        if (this.lmsProvider === 'moodle') {
            await this.createMoodleUser(userData);
        } else if (this.lmsProvider === 'canvas') {
            await this.createCanvasUser(userData);
        } else {
            console.log(`👤 [LMS] Would create user:`, userData);
        }
    }

    private async enrollInLmsCourse(
        enrollment: any,
        courseOffering: any,
    ): Promise<void> {
        const enrollmentData = {
            userId: enrollment.student_profile.student_id_number,
            courseId: `${courseOffering.course.code}-${courseOffering.semester.code}`,
            role: 'student',
        };

        if (this.lmsProvider === 'moodle') {
            await this.enrollMoodleCourse(enrollmentData);
        } else if (this.lmsProvider === 'canvas') {
            await this.enrollCanvasCourse(enrollmentData);
        } else {
            console.log(`📚 [LMS] Would enroll:`, enrollmentData);
        }
    }

    // ============================================
    // Moodle Implementation
    // ============================================

    private async createMoodleUser(userData: any): Promise<void> {
        // Placeholder for Moodle API
        // In production, use Moodle Web Services API:
        // const response = await axios.post(`${this.lmsApiUrl}/webservice/rest/server.php`, {
        //   wstoken: this.lmsApiKey,
        //   wsfunction: 'core_user_create_users',
        //   moodlewsrestformat: 'json',
        //   users: [userData],
        // });

        console.log(`👤 [Moodle] Would create user: ${userData.username}`);
    }

    private async createMoodleCourse(offering: any): Promise<void> {
        console.log(`📚 [Moodle] Would create course: ${offering.course.code}`);
    }

    private async enrollMoodleCourse(enrollmentData: any): Promise<void> {
        console.log(
            `📚 [Moodle] Would enroll ${enrollmentData.userId} in ${enrollmentData.courseId}`,
        );
    }

    // ============================================
    // Canvas Implementation
    // ============================================

    private async createCanvasUser(userData: any): Promise<void> {
        // Placeholder for Canvas API
        // In production, use Canvas REST API:
        // const response = await axios.post(
        //   `${this.lmsApiUrl}/api/v1/accounts/1/users`,
        //   { user: userData },
        //   { headers: { Authorization: `Bearer ${this.lmsApiKey}` } }
        // );

        console.log(`👤 [Canvas] Would create user: ${userData.username}`);
    }

    private async createCanvasCourse(offering: any): Promise<void> {
        console.log(`📚 [Canvas] Would create course: ${offering.course.code}`);
    }

    private async enrollCanvasCourse(enrollmentData: any): Promise<void> {
        console.log(
            `📚 [Canvas] Would enroll ${enrollmentData.userId} in ${enrollmentData.courseId}`,
        );
    }

    // ============================================
    // Logging
    // ============================================

    private logCourseSync(offering: any): void {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📚 [LMS] Course Sync - Development Mode`);
        console.log(`Course: ${offering.course.code} - ${offering.course.name}`);
        console.log(`Semester: ${offering.semester.code}`);
        console.log(`Section: ${offering.section_code}`);
        console.log(`Instructor: ${offering.instructor?.legal_name || 'TBA'}`);
        console.log(`${'='.repeat(60)}\n`);
    }
}
