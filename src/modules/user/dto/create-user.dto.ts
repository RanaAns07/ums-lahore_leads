import {
    IsUUID,
    IsEmail,
    IsString,
    MinLength,
    Matches,
} from 'class-validator';

export class CreateUserDto {
    @IsUUID()
    person_id: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain uppercase, lowercase, and number/symbol',
    })
    password: string;
}
