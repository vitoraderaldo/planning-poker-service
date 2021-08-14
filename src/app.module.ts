import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlanningModule } from './planning/planning.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
const cookieSession = require('cookie-session');

@Module({
  imports: [
    PlanningModule, 
    UserModule,
    MongooseModule.forRoot(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`, {
      user: process.env.MONGO_USER, 
      pass: process.env.MONGO_PASSWORD,
      dbName: process.env.MONGO_DATABASE
    })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true
      })
    }
  ],
})
export class AppModule {

  configure(consumer: MiddlewareConsumer) {
    
    consumer.apply(
      cookieSession({
        keys: [process.env.COOKIE_KEY]
      })
    ).forRoutes('*')

    

  }
}
