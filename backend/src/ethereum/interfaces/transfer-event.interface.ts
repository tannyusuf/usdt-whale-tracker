export interface TransferEvent {
  from: string;
  to: string;
  value: bigint;
  amount: number;
  transactionHash: string;
  blockNumber: bigint;
  timestamp: Date;
}
