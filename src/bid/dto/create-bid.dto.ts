import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsNotEmpty, IsNumber, Min} from 'class-validator';

export class CreateBidDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The collection ID to bid on',
  })
  @IsString()
  @IsNotEmpty()
  collectionId: string;

  @ApiProperty({example: 1500.0, description: 'The bid amount'})
  @IsNumber()
  @Min(0)
  price: number;
}
