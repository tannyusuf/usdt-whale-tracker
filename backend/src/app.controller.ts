import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseService } from './firebase/firebase.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('subscribe')
  async subscribe(@Body('token') token: string) {
    await this.firebaseService.subscribeToTopic(token);
    return { success: true };
  }
}
