import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { EventsSeederService } from '../events/events.seeder';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = appContext.get(DataSource);
    if (dataSource.options?.synchronize) {
      await dataSource.synchronize();
    }

    const eventsSeeder = appContext.get(EventsSeederService);
    await eventsSeeder.seedInitialEvents();
    console.log('Seed completed');
  } catch (error) {
    console.error('Seed failed', error);
    process.exitCode = 1;
  } finally {
    await appContext.close();
  }
}

bootstrap();
