import { IsUUID } from 'class-validator';

export class ProvisionStudentDto {
    @IsUUID()
    application_id: string;
}
