import { ApiProperty } from '@nestjs/swagger';

export class PurchaseItemDto {
  @ApiProperty({ description: 'ID of the listing to purchase' })
  listingId: number;

  @ApiProperty({ description: 'Value to send in wei as a string' })
  value: string;
}
