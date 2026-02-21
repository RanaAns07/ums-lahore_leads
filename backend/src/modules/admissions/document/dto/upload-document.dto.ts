import { IsEnum, IsString, IsUrl } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UploadDocumentDto {
    @IsEnum(DocumentType)
    document_type: DocumentType;

    @IsString()
    @IsUrl()
    file_url: string;
}
