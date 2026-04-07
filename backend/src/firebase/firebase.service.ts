import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { TransferEvent } from '../ethereum/interfaces/transfer-event.interface';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private db: admin.firestore.Firestore;
  private messaging: admin.messaging.Messaging;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
        clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
        privateKey: this.configService
          .get<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
      }),
    });

    this.db = admin.firestore();
    this.messaging = admin.messaging();
    this.logger.log('Firebase Admin SDK initialized');
  }

  async handleWhaleTransfer(transfer: TransferEvent): Promise<void> {
    await Promise.all([
      this.saveTransfer(transfer),
      this.sendNotification(transfer),
    ]);
  }

  private async saveTransfer(transfer: TransferEvent): Promise<void> {
    try {
      const docRef = await this.db.collection('whale-transfers').add({
        from: transfer.from,
        to: transfer.to,
        amount: transfer.amount,
        rawValue: transfer.value.toString(),
        transactionHash: transfer.transactionHash,
        blockNumber: Number(transfer.blockNumber),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      this.logger.log(
        `Firestore: Transfer saved (doc: ${docRef.id}) | ${transfer.amount.toLocaleString()} USDT`,
      );
    } catch (error) {
      this.logger.error('Firestore: Failed to save transfer', error);
    }
  }

  async subscribeToTopic(token: string): Promise<void> {
    try {
      await this.messaging.subscribeToTopic([token], 'whale-alerts');
      this.logger.log(`FCM: Token subscribed to whale-alerts`);
    } catch (error) {
      this.logger.error('FCM: Failed to subscribe token', error);
    }
  }

  private async sendNotification(transfer: TransferEvent): Promise<void> {
    try {
      const message: admin.messaging.Message = {
        topic: 'whale-alerts',
        notification: {
          title: 'Whale Alert!',
          body: `${transfer.amount.toLocaleString()} USDT transfer detected`,
        },
        data: {
          senderAddress: transfer.from,
          receiverAddress: transfer.to,
          amount: transfer.amount.toString(),
          transactionHash: transfer.transactionHash,
          type: 'whale-transfer',
        },
      };

      const response = await this.messaging.send(message);
      this.logger.log(`FCM: Notification sent (${response})`);
    } catch (error) {
      this.logger.error('FCM: Failed to send notification', error);
    }
  }
}
