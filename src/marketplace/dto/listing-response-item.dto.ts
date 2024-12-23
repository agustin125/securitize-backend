export class ListingsResponseDto {
  seller: string;
  token: string;
  amount: string;
  price: string;

  constructor(seller: string, token: string, amount: bigint, price: bigint) {
    this.seller = seller;
    this.token = token;
    this.amount = amount.toString();
    this.price = price.toString();
  }
}
