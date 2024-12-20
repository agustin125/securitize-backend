import { ApiProperty } from '@nestjs/swagger';

export class TransferItemDto {
  @ApiProperty({ description: 'Token address of the item' })
  token: string;

  @ApiProperty({ description: 'Address of the sender' })
  from: string;

  @ApiProperty({ description: 'Address of the recipient' })
  to: string;

  @ApiProperty({ description: 'Amount to transfer' })
  amount: number;

  @ApiProperty({ description: 'Nonce for the transfer' })
  nonce: number;

  @ApiProperty({ description: 'Signature for the transfer' })
  signature: string;
}
