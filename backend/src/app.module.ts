import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { EventsModule } from './events/events.module';
import { Event } from './events/entities/event.entity';
import { Order } from './events/entities/order.entity';
import { Ticket } from './events/entities/ticket.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    TypeOrmModule.forRootAsync({
      inject: [configuration.KEY],
      useFactory: (config: ConfigType<typeof configuration>) => ({
        type: 'postgres',
        host: config.database.host,
        port: config.database.port,
        username: config.database.username,
        password: config.database.password,
        database: config.database.name,
        entities: [Event, Order, Ticket],
        synchronize: config.database.synchronize||true,
        logging: config.database.logging
      })
    }),
    EventsModule
  ]
})
export class AppModule {}
