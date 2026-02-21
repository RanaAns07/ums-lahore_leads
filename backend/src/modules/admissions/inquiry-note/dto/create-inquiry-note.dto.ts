import { IsString } from 'class-validator';

export class CreateInquiryNoteDto {
    @IsString()
    note_text: string;
}
