import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap()
{
	const app = await NestFactory.create(AppModule);
	app.enableCors(
	{
		origin: '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true,
	});
	app.useWebSocketAdapter(new WsAdapter(app));
	await app.listen(8003, '0.0.0.0');
}

bootstrap();
