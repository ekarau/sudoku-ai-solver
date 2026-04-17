import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Room } from './room.entity';

@Injectable()
export class RoomCleanupService
{
	private readonly logger = new Logger(RoomCleanupService.name);
	constructor( @InjectRepository(Room)
		private roomRepository: Repository<Room> )
	{}

	@Interval(2000)
	async	cleanupGhostRooms()
	{
		const fiveSecondsAgo = new Date(Date.now() - 5000);
		const ghostRooms = await this.roomRepository.find({
			where: {
				status: 'waiting',
				lastHeartbeat: LessThan(fiveSecondsAgo)
			}
		});
		if (ghostRooms.length > 0)
		{
			for (const room of ghostRooms)
			{
				await this.roomRepository.delete(room.id);
				this.logger.log(`Ghost Room ${room.id} deleted (No heartbeat for 5s)`);
			}
		}
	}
}
