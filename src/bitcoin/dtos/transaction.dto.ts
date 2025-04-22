import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class ToAddress {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class TransactionDto {
  @IsString()
  @IsNotEmpty()
  privateKey: string;

  @ApiProperty({
    description: 'Array of recipients with their addresses and amounts',
    example: [{ address: 'tb1qexample...', amount: 0.00001 }],
    type: 'array',
    items: {
      type: 'object',
      properties: {
        address: { type: 'string', example: 'tb1qexample...' },
        amount: { type: 'number', example: 0.00001 },
      },
    },
  })
  @IsArray()
  @IsNotEmpty()
  receivers: ToAddress[];
}
