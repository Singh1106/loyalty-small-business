import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Loyalty 4 ABC')
    .setDescription('Loyalty Rewards for Admin, Business and customers')
    .setVersion('1.0')
    .addTag('L4ABC')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT);
}
bootstrap();
