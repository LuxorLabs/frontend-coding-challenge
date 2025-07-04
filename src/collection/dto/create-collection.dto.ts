import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsNotEmpty, IsNumber, IsOptional, Min} from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({
    example: 'Rare Digital Art Collection',
    description: 'The name of the collection',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example:
      'A unique collection of digital artwork featuring abstract designs',
    description: 'Description of the collection',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({example: 10, description: 'Number of items in stock'})
  @IsNumber()
  @Min(1)
  stocks: number;

  @ApiProperty({example: 1299.99, description: 'Base price of the collection'})
  @IsNumber()
  @Min(0)
  price: number;
}
