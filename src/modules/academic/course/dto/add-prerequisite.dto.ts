import { IsUUID } from 'class-validator';

export class AddPrerequisiteDto {
    @IsUUID()
    prerequisite_course_id: string;
}
