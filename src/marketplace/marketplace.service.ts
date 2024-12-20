import { Injectable } from '@nestjs/common';
import { ethers, BigNumberish } from 'ethers';
import abi from '../../ABIs/marketplace.json';

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

  async listItem(token: string, amount: number, price: number): Promise<any> {
    return await this.contract.listItem(token, amount, price);
  }

  async purchaseItem(listingId: number, value: BigNumberish): Promise<any> {
    return await this.contract.purchaseItem(listingId, { value });
  }

  async withdrawFunds(): Promise<any> {
    return await this.contract.withdrawFunds();
  }

  async transferWithSignature(
    token: string,
    from: string,
    to: string,
    amount: number,
    nonce: number,
    signature: string,
  ): Promise<any> {
    return await this.contract.transferWithSignature(
      token,
      from,
      to,
      amount,
      nonce,
      signature,
    );
  }

  async getEarnings(address: string): Promise<ethers.BigNumberish> {
    return await this.contract.earnings(address);
  }

  async signMessage(data: object): Promise<string> {
    const domain = {
      name: 'YourAppName',
      version: '1',
      chainId: await this.provider
        .getNetwork()
        .then((network) => network.chainId),
      verifyingContract: process.env.CONTRACT_ADDRESS,
    };

    const types = {
      Message: [{ name: 'data', type: 'string' }],
    };

    return this.wallet.signTypedData(domain, types, data);
  }

  async pushSignedTransaction(signedMessage: string): Promise<any> {
    const tx = await this.wallet.sendTransaction({
      to: process.env.CONTRACT_ADDRESS,
      data: signedMessage,
    });
    return tx.wait();
  }
}
