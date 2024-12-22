import { Injectable } from '@nestjs/common';
import { ethers, BigNumberish } from 'ethers';
import abi from '../../ABIs/marketplace.json';
import abiToken from '../../ABIs/token.json';
import { ListItemBehalfDto } from './dto/list-item-behalf.dto';
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

  async listItem(listItemDto: ListItemDto): Promise<ResponseDto[]> {
    const { token, amount, price, address } = listItemDto;
    const tokenContract = new ethers.Contract(token, abiToken, this.wallet);
    const spenderAddress = this.contract.target;
    const responses: ResponseDto[] = [];

    await this.checkNeedAllowance(
      tokenContract,
      address,
      spenderAddress,
      amount,
      responses,
    );

    const unsignedTx = await this.contract.listItem.populateTransaction(
      token,
      amount,
      price,
    );

    responses.push(
      this.mapResponse(
        unsignedTx,
        'Please sign this transaction with your wallet to withdraw your funds.',
      ),
    );

    return responses;
  }

  async listItemBehalf(listItemDto: ListItemBehalfDto): Promise<ResponseDto> {
    const { token, amount, price, signature, address } = listItemDto;

    const tokenContract = new ethers.Contract(token, abiToken, this.wallet);
    const spenderAddress = this.contract.target;
    const responses: ResponseDto[] = [];
    if (
      await this.checkNeedAllowance(
        tokenContract,
        address,
        spenderAddress,
        amount,
        responses,
      )
    ) {
      return responses[0];
    }

    const txResponse = await this.contract.listItemBehalf(
      token,
      amount,
      price,
      signature,
      address,
    );
    const receipt = await txResponse.wait();

    return this.mapResponse(
      null,
      `Transaction successful! Hash: ${receipt.transactionHash}`,
    );
  }

  private async checkNeedAllowance(
    tokenContract: ethers.Contract,
    signer: any,
    spenderAddress: string | ethers.Addressable,
    amount: number,
    responses: ResponseDto[],
  ): Promise<boolean> {
    const allowance = await tokenContract.allowance(signer, spenderAddress);
    const needAllowance = BigInt(allowance) < BigInt(amount);
    if (needAllowance) {
      const unsignedApproveTx = await tokenContract.approve.populateTransaction(
        spenderAddress,
        amount,
      );

      responses.push(
        this.mapResponse(
          unsignedApproveTx,
          'Please sign this transaction to approve token spending.',
        ),
      );
    }
    return needAllowance;
  }

  async purchaseItem(
    listingId: number,
    value: BigNumberish,
  ): Promise<ResponseDto> {
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
  ): ResponseDto {
    return new ResponseDto(unsignedTx, message);
  }
}
