import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class RegisterCoursesDto {
    @IsArray()
    @IsUUID('4', { each: true })
    @ArrayMinSize(1)
    offering_ids: string[];
}
