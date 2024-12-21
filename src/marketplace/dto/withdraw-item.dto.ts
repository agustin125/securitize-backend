import { ApiProperty } from '@nestjs/swagger';

export class WithdrawItemDto {
  @ApiProperty({ description: 'signer address' })
  signerAddress: string;
}
