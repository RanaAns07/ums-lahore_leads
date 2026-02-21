import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed script for UMS database initialization
 * 
 * This script:
 * 1. Creates all system permissions
 * 2. Creates Super Admin role
 * 3. Links all permissions to Super Admin
 * 4. Creates default admin Person
 * 5. Creates default admin User with hashed password
 * 6. Assigns Super Admin role to admin user
 * 
 * IDEMPOTENT: Can be run multiple times without creating duplicates
 */

// Admin configuration from environment
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ums.edu';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
const ADMIN_LEGAL_NAME = process.env.ADMIN_LEGAL_NAME || 'System Administrator';

async function main(): Promise<void> {
    console.log('🌱 Starting database seed...\n');

    // ============================================
    // 1. CREATE PERMISSIONS
    // ============================================
    console.log('📋 Creating permissions...');

    const permissions = [
        // Person module
        { name: 'person.read', resource: 'person', action: 'read' },
        { name: 'person.create', resource: 'person', action: 'create' },
        { name: 'person.update', resource: 'person', action: 'update' },
        { name: 'person.delete', resource: 'person', action: 'delete' },

        // User module
        { name: 'user.read', resource: 'user', action: 'read' },
        { name: 'user.create', resource: 'user', action: 'create' },
        { name: 'user.update', resource: 'user', action: 'update' },
        { name: 'user.delete', resource: 'user', action: 'delete' },

        // Admissions
        { name: 'admissions.read', resource: 'admissions', action: 'read' },
        { name: 'admissions.write', resource: 'admissions', action: 'write' },

        // Enrollment
        { name: 'academic.enrollment.read', resource: 'enrollment', action: 'read' },
        { name: 'academic.enrollment.write', resource: 'enrollment', action: 'write' },
        { name: 'student.self.read', resource: 'student', action: 'read' },
        { name: 'student.self.write', resource: 'student', action: 'write' },

        // Finance
        { name: 'finance.read', resource: 'finance', action: 'read' },
        { name: 'finance.write', resource: 'finance', action: 'write' },
        { name: 'finance.admin', resource: 'finance', action: 'admin' },

        // Academic - Department
        { name: 'academic.department.read', resource: 'department', action: 'read' },
        { name: 'academic.department.write', resource: 'department', action: 'write' },

        // Academic - Program
        { name: 'academic.program.read', resource: 'program', action: 'read' },
        { name: 'academic.program.write', resource: 'program', action: 'write' },

        // Academic - Course
        { name: 'academic.course.read', resource: 'course', action: 'read' },
        { name: 'academic.course.write', resource: 'course', action: 'write' },

        // Academic - Semester
        { name: 'academic.semester.read', resource: 'semester', action: 'read' },
        { name: 'academic.semester.write', resource: 'semester', action: 'write' },

        // Academic - Offering
        { name: 'academic.offering.read', resource: 'offering', action: 'read' },
        { name: 'academic.offering.write', resource: 'offering', action: 'write' },
    ];

    const createdPermissions = [];
    for (const permission of permissions) {
        const perm = await prisma.permission.upsert({
            where: { name: permission.name },
            update: {},
            create: permission,
        });
        createdPermissions.push(perm);
    }

    console.log(`   ✅ Created/verified ${createdPermissions.length} permissions\n`);

    // ============================================
    // 2. CREATE SUPER ADMIN ROLE
    // ============================================
    console.log('👑 Creating Super Admin role...');

    const superAdminRole = await prisma.role.upsert({
        where: { name: 'Super Admin' },
        update: {},
        create: {
            name: 'Super Admin',
            description: 'Full system access with all permissions',
        },
    });

    console.log(`   ✅ Role: ${superAdminRole.name}\n`);

    // ============================================
    // 3. LINK PERMISSIONS TO SUPER ADMIN
    // ============================================
    console.log('🔗 Linking permissions to Super Admin...');

    const rolePermissions = createdPermissions.map((perm) => ({
        role_id: superAdminRole.id,
        permission_id: perm.id,
    }));

    // Use createMany with skipDuplicates to prevent errors on re-seed
    await prisma.rolePermission.createMany({
        data: rolePermissions,
        skipDuplicates: true,
    });

    console.log(`   ✅ Linked ${rolePermissions.length} permissions\n`);

    // ============================================
    // 4. CREATE DEFAULT ADMIN PERSON
    // ============================================
    console.log('👤 Creating default admin Person...');

    const adminPerson = await prisma.person.upsert({
        where: {
            // Since legal_name is not unique, we need a workaround
            // We'll find by legal_name in the update, or create if not exists
            id: '00000000-0000-0000-0000-000000000001', // Deterministic UUID for seed
        },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000001',
            legal_name: ADMIN_LEGAL_NAME,
            date_of_birth: new Date('1990-01-01'),
            gender: 'PREFER_NOT_TO_SAY',
            nationality: 'System',
        },
    });

    console.log(`   ✅ Person: ${adminPerson.legal_name} (${adminPerson.id})\n`);

    // ============================================
    // 5. CREATE DEFAULT ADMIN USER
    // ============================================
    console.log('🔐 Creating default admin User...');

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const adminUser = await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: {
            // Update password if ADMIN_PASSWORD changed
            password_hash: passwordHash,
        },
        create: {
            person_id: adminPerson.id,
            email: ADMIN_EMAIL,
            password_hash: passwordHash,
            status: 'ACTIVE',
            email_verified_at: new Date(),
        },
    });

    console.log(`   ✅ User: ${adminUser.email} (${adminUser.id})\n`);

    // ============================================
    // 6. ASSIGN SUPER ADMIN ROLE TO USER
    // ============================================
    console.log('🎖️  Assigning Super Admin role to user...');

    await prisma.roleAssignment.upsert({
        where: {
            user_id_role_id: {
                user_id: adminUser.id,
                role_id: superAdminRole.id,
            },
        },
        update: {},
        create: {
            user_id: adminUser.id,
            role_id: superAdminRole.id,
            assigned_by: adminUser.id, // Self-assigned
            expires_at: null, // Never expires
        },
    });

    console.log(`   ✅ Role assigned\n`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('✨ Database seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Permissions: ${createdPermissions.length}`);
    console.log(`   - Roles: 1 (Super Admin)`);
    console.log(`   - Admin User: ${ADMIN_EMAIL}`);
    console.log(`   - Admin Password: ${ADMIN_PASSWORD.slice(0, 3)}${'*'.repeat(ADMIN_PASSWORD.length - 3)}`);
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
