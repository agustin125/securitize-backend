import { ApiProperty } from '@nestjs/swagger';

export class ListItemDto {
  @ApiProperty({
    description: 'Token address of the item',
    example: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  })
  token: string;

  @ApiProperty({ description: 'Amount of the item', example: 10000 })
  amount: number;

  @ApiProperty({ description: 'Price of the item in wei', example: 2 })
  price: number;

  @ApiProperty({ description: 'Price of the item in wei', example: 1 })
  nonce: number;

  @ApiProperty({
    description: 'Signature of the item',
    example: '0xe7f1725E7734CE288F8367e1Bb...',
  })
  signature: string;

  @ApiProperty({
    description: 'Signer of the item',
    example: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  })
  signer: string;
}
