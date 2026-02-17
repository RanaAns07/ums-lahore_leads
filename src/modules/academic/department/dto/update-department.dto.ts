import { IsString, IsUUID, IsOptional } from 'class-validator';

export class UpdateDepartmentDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsUUID()
    head_of_dept_id?: string;
}
