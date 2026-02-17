import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * UserService manages authentication credentials and user accounts
 */
@Injectable()
export class UserService {
    private readonly SALT_ROUNDS = 10;

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new User account
     */
    async create(data: CreateUserDto): Promise<User> {
        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

        // Create user
        return this.prisma.user.create({
            data: {
                person_id: data.person_id,
                email: data.email,
                password_hash: passwordHash,
            },
            include: {
                person: true,
            },
        });
    }

    /**
     * Find a User by email (excludes soft-deleted)
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email, deleted_at: null },
            include: {
                person: true,
                role_assignments: {
                    include: {
                        role: {
                            include: {
                                role_permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Find a User by ID (excludes soft-deleted)
     */
    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id, deleted_at: null },
            include: {
                person: true,
                role_assignments: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }

    /**
     * Find a User by ID or throw NotFoundException
     */
    async findByIdOrFail(id: string): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    /**
     * Update user details
     */
    async update(id: string, data: UpdateUserDto): Promise<User> {
        await this.findByIdOrFail(id); // Ensure exists
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    /**
     * Update user password
     */
    async updatePassword(id: string, newPassword: string): Promise<void> {
        await this.findByIdOrFail(id); // Ensure exists
        const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
        await this.prisma.user.update({
            where: { id },
            data: { password_hash: passwordHash },
        });
    }

    /**
     * Update user status
     */
    async updateStatus(id: string, status: UserStatus): Promise<User> {
        await this.findByIdOrFail(id); // Ensure exists
        return this.prisma.user.update({
            where: { id },
            data: { status },
        });
    }

    /**
     * Update last login timestamp
     */
    async updateLastLogin(id: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: { last_login_at: new Date() },
        });
    }

    /**
     * Verify user password
     */
    async verifyPassword(user: User, password: string): Promise<boolean> {
        return bcrypt.compare(password, user.password_hash);
    }

    /**
     * Soft delete a User
     */
    async softDelete(id: string): Promise<void> {
        await this.findByIdOrFail(id); // Ensure exists
        await this.prisma.user.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
    }

    /**
     * Find all Users with pagination (excludes soft-deleted)
     */
    async findAll(skip = 0, take = 50): Promise<User[]> {
        return this.prisma.user.findMany({
            where: { deleted_at: null },
            skip,
            take,
            orderBy: { created_at: 'desc' },
            include: {
                person: true,
            },
        });
    }
}
