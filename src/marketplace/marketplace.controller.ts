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
import { ListItemBehalfDto } from './dto/list-item-behalf.dto';
import { ListItemDto } from './dto/list-item.dto';
import { PurchaseItemDto } from './dto/purchase-item.dto';
import { WithdrawItemDto } from './dto/withdraw-item.dto';
import { ethers } from 'ethers';
import { ResponseDto } from './dto/response-item.dto';

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
    type: ResponseDto,
  })
  @Post('list')
  @HttpCode(HttpStatus.CREATED)
  async listItem(@Body() listItemDto: ListItemDto): Promise<ResponseDto[]> {
    return await this.marketplaceService.listItem(listItemDto);
  }

  @Post('listBehalf')
  @HttpCode(HttpStatus.CREATED)
  async listItemBehalf(
    @Body() listItemDto: ListItemBehalfDto,
  ): Promise<ResponseDto> {
    return await this.marketplaceService.listItemBehalf(listItemDto);
  }

  @ApiOperation({ summary: 'Purchase an item' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Item purchased successfully',
    type: ResponseDto,
  })
  @Post('purchase')
  @HttpCode(HttpStatus.OK)
  async purchaseItem(
    @Body() purchaseItemDto: PurchaseItemDto,
  ): Promise<ResponseDto> {
    return await this.marketplaceService.purchaseItem(
      purchaseItemDto.listingId,
      ethers.parseUnits(purchaseItemDto.value, 18),
    );
  }

  @ApiOperation({ summary: 'Withdraw accumulated funds' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Funds withdrawn successfully',
    type: ResponseDto,
  })
  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  async withdrawFunds(
    @Body() withdrawItemDto: WithdrawItemDto,
  ): Promise<ResponseDto> {
    return await this.marketplaceService.withdrawFunds(withdrawItemDto);
  }
}
