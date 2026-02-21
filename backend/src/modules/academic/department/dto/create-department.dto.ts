import {
    IsString,
    IsUUID,
    IsOptional,
    MinLength,
    MaxLength,
} from 'class-validator';

export class CreateDepartmentDto {
    @IsString()
    @MinLength(2)
    name: string;

    @IsString()
    @MinLength(2)
    @MaxLength(10)
    code: string;

    @IsOptional()
    @IsUUID()
    head_of_dept_id?: string;
}
