import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { ListItemDto } from './dto/list-item.dto';
import { PurchaseItemDto } from './dto/purchase-item.dto';
import { TransferItemDto } from './dto/transfer-item.dto';
import { ethers } from 'ethers';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @ApiOperation({ summary: 'Get all listed items' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all marketplace items',
  })
  @Get('items')
  @HttpCode(HttpStatus.OK)
  async getItems() {
    return await this.marketplaceService.getListings();
  }

  @ApiOperation({ summary: 'List a new item for sale' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Item listed successfully',
  })
  @Post('list')
  @HttpCode(HttpStatus.CREATED)
  async listItem(@Body() listItemDto: ListItemDto) {
    return await this.marketplaceService.listItem(
      listItemDto.token,
      listItemDto.amount,
      listItemDto.price,
    );
  }

  @ApiOperation({ summary: 'Purchase an item' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Item purchased successfully',
  })
  @Post('purchase')
  @HttpCode(HttpStatus.OK)
  async purchaseItem(@Body() purchaseItemDto: PurchaseItemDto) {
    return await this.marketplaceService.purchaseItem(
      purchaseItemDto.listingId,
      ethers.parseUnits(purchaseItemDto.value, 18),
    );
  }

  @ApiOperation({ summary: 'Withdraw accumulated funds' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Funds withdrawn successfully',
  })
  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  async withdrawFunds() {
    return await this.marketplaceService.withdrawFunds();
  }

  @ApiOperation({ summary: 'Transfer tokens with a signed message' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens transferred successfully',
  })
  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  async transferWithSignature(@Body() transferItemDto: TransferItemDto) {
    return await this.marketplaceService.transferWithSignature(
      transferItemDto.token,
      transferItemDto.from,
      transferItemDto.to,
      transferItemDto.amount,
      transferItemDto.nonce,
      transferItemDto.signature,
    );
  }
}
