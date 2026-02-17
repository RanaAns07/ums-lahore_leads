import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { Person } from '@prisma/client';

/**
 * PersonService manages immutable identity data
 */
@Injectable()
export class PersonService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new Person record
     */
    async create(data: CreatePersonDto): Promise<Person> {
        return this.prisma.person.create({
            data: {
                legal_name: data.legal_name,
                date_of_birth: data.date_of_birth,
                gender: data.gender,
                nationality: data.nationality,
            },
        });
    }

    /**
     * Find a Person by ID (excludes soft-deleted)
     */
    async findById(id: string): Promise<Person | null> {
        return this.prisma.person.findUnique({
            where: { id, deleted_at: null },
            include: {
                user: true,
            },
        });
    }

    /**
     * Find a Person by ID or throw NotFoundException
     */
    async findByIdOrFail(id: string): Promise<Person> {
        const person = await this.findById(id);
        if (!person) {
            throw new NotFoundException(`Person with ID ${id} not found`);
        }
        return person;
    }

    /**
     * Find all Persons with pagination (excludes soft-deleted)
     */
    async findAll(skip = 0, take = 50): Promise<Person[]> {
        return this.prisma.person.findMany({
            where: { deleted_at: null },
            skip,
            take,
            orderBy: { created_at: 'desc' },
        });
    }

    /**
     * Soft delete a Person
     */
    async softDelete(id: string): Promise<void> {
        await this.findByIdOrFail(id); // Ensure exists
        await this.prisma.person.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
    }
}
