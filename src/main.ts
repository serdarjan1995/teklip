import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import * as basicAuth from 'express-basic-auth';

const SWAGGER_ENVS = ['local', 'dev', 'production'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (SWAGGER_ENVS.includes(process.env.NODE_ENV as string)) {
    app.use(
      ['/docs', '/docs-json'],
      basicAuth({
        challenge: true,
        users: {
          [process.env.SWAGGER_USER as string]: process.env
            .SWAGGER_PASSWORD as string,
        },
      }),
    );

    const config = new DocumentBuilder()
      .setTitle('Teklip API docs')
      .setDescription('Teklip API specification')
      .setVersion('1.0')
      .addSecurity('bearer', {
        type: 'http',
        scheme: 'bearer',
      })
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map((error) => {
          return {
            field: error.property,
            value: `${error.value}.`,
            message: `${error.property} has wrong value ${error.value}.`,
            errors: Object.values(error.constraints as object),
          };
        });

        return new BadRequestException(messages);
      },
    }),
  );
  await app.listen(3000);
}

bootstrap();
