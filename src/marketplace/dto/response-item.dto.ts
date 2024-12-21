import { ContractTransaction } from 'ethers';

export class ResponseDto {
  unsignedTx: ContractTransaction;
  message: string;

  constructor(unsignedTx: ContractTransaction, message: string) {
    this.unsignedTx = unsignedTx;
    this.message = message;
  }
}
