import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppGateway } from './app.gateway';
import { CombatController } from './combat.controller';
import { AppController } from './app.controller';
import { Room } from './room.entity';
import { RoomCleanupService } from './room-cleanup.service';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'room_db',
			port: 5432,
			username: process.env.POSTGRES_USER_room,
			password: process.env.POSTGRES_PASSWORD_room,
			database: process.env.POSTGRES_DB_room,
			entities: [Room],
			synchronize: true,
		}),
		TypeOrmModule.forFeature([Room]),
		ScheduleModule.forRoot()
	],
	controllers: [CombatController, AppController],
	providers: [AppGateway, RoomCleanupService]
})

export class AppModule {}
