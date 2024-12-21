import { Injectable } from '@nestjs/common';
import { ethers, BigNumberish } from 'ethers';
import abi from '../../ABIs/marketplace.json';
import { ListItemDto } from './dto/list-item.dto';
import { WithdrawItemDto } from './dto/withdraw-item.dto';
import { ResponseDto } from './dto/response-item.dto';

@Injectable()
export class MarketplaceService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
  }

  async getListings(): Promise<any[]> {
    const listingCount = await this.contract.listingIdCounter();
    const listings = [];
    for (let i = 0; i < listingCount; i++) {
      try {
        const listing = await this.contract.listings(i);
        listings.push(listing);
      } catch {
        // if ID not exists, skip
      }
    }
    return listings;
  }

  async listItem(listItemDto: ListItemDto): Promise<any> {
    const { token, amount, price, nonce, signature, signer } = listItemDto;
    if (!signature) {
      const unsignedTx = await this.contract.listItem.populateTransaction(
        token,
        amount,
        price,
        nonce,
      );

      return this.mapResponse(
        unsignedTx,
        'Please sign this transaction with your wallet to withdraw your funds.',
      );
    }

    const recoveredAddress = ethers.verifyMessage(
      JSON.stringify({ token, amount, price, nonce }),
      signature,
    );

    if (recoveredAddress.toLowerCase() !== signer.toLowerCase()) {
      throw new Error('Signature validation failed. Invalid signer.');
    }

    await this.contract.listItem(
      token,
      amount,
      price,
      nonce,
      signature,
      signer,
    );

    return this.mapResponse(null, 'Item listed successfully.');
  }

  async purchaseItem(listingId: number, value: BigNumberish): Promise<any> {
    if (!Number.isInteger(listingId) || listingId < 0) {
      throw new Error('Invalid listingId. It must be a non-negative integer.');
    }

    if (BigInt(value) <= 0n) {
      throw new Error('Invalid value. It must be a positive number.');
    }

    const listing = await this.contract.listings(listingId);
    if (!listing || listing.amount === 0n) {
      throw new Error(
        `Listing with ID ${listingId} does not exist or is sold out.`,
      );
    }

    const unsignedTx = await this.contract.purchaseItem.populateTransaction(
      listingId,
      {
        value,
      },
    );

    return this.mapResponse(
      unsignedTx,
      'Please sign this transaction with your wallet to withdraw your funds.',
    );
  }

  async withdrawFunds(withdrawItemDto: WithdrawItemDto): Promise<ResponseDto> {
    const earnings = await this.contract.earnings(
      withdrawItemDto.signerAddress,
    );

    if (BigInt(earnings) <= 0n) {
      throw new Error('No funds available to withdraw.');
    }

    const unsignedTx = await this.contract.withdrawFunds.populateTransaction();
    return this.mapResponse(
      unsignedTx,
      'Please sign this transaction with your wallet to withdraw your funds.',
    );
  }

  private mapResponse(
    unsignedTx: ethers.ContractTransaction | null,
    message: string,
  ): ResponseDto | PromiseLike<ResponseDto> {
    return new ResponseDto(unsignedTx, message);
  }
}
