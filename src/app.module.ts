import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlanningModule } from './planning/planning.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
const cookieSession = require('cookie-session');
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `environments/${process.env.ENV}.env`
    }),
    PlanningModule,
    UserModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: 'mongodb://'
              .concat(configService.get('MONGO_USER'))
              .concat(':')
              .concat(configService.get('MONGO_PASSWORD'))
              .concat('@')
              .concat(configService.get('MONGO_HOST'))
              .concat(':')
              .concat(configService.get('MONGO_PORT')),
       dbName: configService.get('MONGO_DATABASE')
      })
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

  constructor(
    private configService: ConfigService
  ) {}

  configure(consumer: MiddlewareConsumer) {

    consumer.apply(
      cookieSession({
        keys: [this.configService.get('COOKIE_KEY')]
      })
    ).forRoutes('*')
  }
}
