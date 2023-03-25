import { ApiProperty } from '@nestjs/swagger'
import {
    IsNumber,
    IsOptional,
	IsString
} from 'class-validator'

export class SampleDto {

    @IsString()
    @ApiProperty()
    test1: string

    @IsString()
    @ApiProperty()
    @IsOptional()
    test2: string

    @IsNumber()
    @ApiProperty()
    test3: number
}