import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPublicClient,
  webSocket,
  parseAbi,
  formatUnits,
  type PublicClient,
  type WatchContractEventReturnType,
} from 'viem';
import { mainnet } from 'viem/chains';
import { TransferEvent } from './interfaces/transfer-event.interface';

const USDT_ABI = parseAbi([
  'event Transfer(address indexed from, address indexed to, uint256 value)',
]);

const USDT_DECIMALS = 6;

@Injectable()
export class EthereumService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EthereumService.name);
  private client: PublicClient;
  private unwatch: WatchContractEventReturnType | null = null;
  private readonly contractAddress: `0x${string}`;
  private readonly threshold: bigint;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 20;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(private readonly configService: ConfigService) {
    this.contractAddress = this.configService.get<string>(
      'USDT_CONTRACT_ADDRESS',
    ) as `0x${string}`;

    const thresholdUsdt = this.configService.get<number>(
      'USDT_TRANSFER_THRESHOLD',
      100000,
    );
    this.threshold = BigInt(thresholdUsdt) * BigInt(10 ** USDT_DECIMALS);
  }

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.cleanup();
  }

  private connect() {
    const wssUrl = this.configService.get<string>('ALCHEMY_WSS_URL');

    try {
      this.client = createPublicClient({
        chain: mainnet,
        transport: webSocket(wssUrl, {
          reconnect: {
            attempts: 5,
            delay: 2000,
          },
        }),
      });

      this.startListening();
      this.reconnectAttempts = 0;
      this.logger.log(
        `Connected to Ethereum mainnet. Watching USDT transfers >= ${formatUnits(this.threshold, USDT_DECIMALS)} USDT`,
      );
    } catch (error) {
      this.logger.error('Failed to connect to Ethereum', error);
      this.scheduleReconnect();
    }
  }

  private startListening() {
    this.unwatch = this.client.watchContractEvent({
      address: this.contractAddress,
      abi: USDT_ABI,
      eventName: 'Transfer',
      onLogs: (logs) => {
        for (const log of logs) {
          this.handleTransferEvent(log);
        }
      },
      onError: (error) => {
        this.logger.error('WebSocket event listener error', error.message);
        this.scheduleReconnect();
      },
    });
  }

  private handleTransferEvent(log: any) {
    const { args, transactionHash, blockNumber } = log;
    const value = args.value as bigint;

    if (value < this.threshold) return;

    const amount = parseFloat(formatUnits(value, USDT_DECIMALS));

    const transfer: TransferEvent = {
      from: args.from as string,
      to: args.to as string,
      value,
      amount,
      transactionHash: transactionHash as string,
      blockNumber: blockNumber as bigint,
      timestamp: new Date(),
    };

    this.logger.warn(
      `WHALE ALERT | ${transfer.amount.toLocaleString()} USDT | ${transfer.from} -> ${transfer.to} | tx: ${transfer.transactionHash}`,
    );

    // Phase 2'de burada Firebase servisine iletilecek
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(
        `Max reconnect attempts (${this.maxReconnectAttempts}) reached. Giving up.`,
      );
      return;
    }

    this.cleanup();

    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      30000,
    );
    this.reconnectAttempts++;

    this.logger.log(
      `Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private cleanup() {
    if (this.unwatch) {
      this.unwatch();
      this.unwatch = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}
