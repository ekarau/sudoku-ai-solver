import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

const ERROR = 
{
	USER_ID_REQUIRED: { success: false, message: 'userId is required' },
	ROOM_ID_REQUIRED: { success: false, message: 'roomId is required' },
	ROOM_NOT_FOUND: { success: false, message: 'Room not found' },
	ROOM_FULL: { success: false, message: 'Room is full' },
	OWNER_CANNOT_JOIN: { success: false, message: 'Owner cannot join as guest' },
	USER_NOT_IN_ROOM: { success: false, message: 'User is not in this room' },
	DIFFICULTY_REQUIRED: { success: false, message: 'Difficulty is required' },
	DB_ERROR: (error: any) => ({ success: false, message: 'Database error: ', error: error.message })
};

@Controller('api/room')
export class AppController
{
	constructor( @InjectRepository(Room)
		private roomRepository: Repository<Room> )
	{}

	private async	findRoom(roomId: string)
	{
		return this.roomRepository.findOne({ where: { id: Number(roomId) } });
	}

	@Post('create')
	async	roomCreate(@Body() body: { userId: string, level: string, ownerName: string })
	{
		if (!body.userId)
			return ERROR.USER_ID_REQUIRED;
		if (!body.level)
			return ERROR.DIFFICULTY_REQUIRED;
		try
		{
			const res = await fetch(`http://game_service:8080/generate?level=${body.level}`,
			{
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});
			const gameData = await res.json();
			const room = this.roomRepository.create({
				ownerId: body.userId,
				ownerName: body.ownerName,
				difficulty: body.level,
				solvedBoard: gameData.solution,
				currBoard: gameData.board,
				health: [3, 3],
				status: 'waiting'
			});
			const saved = await this.roomRepository.save(room);
			return { success: true, roomId: saved.id };
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}

	@Post('join/:roomId')
	async	roomJoin(@Param('roomId') roomId: string, @Body() body: { userId: string })
	{
		if (!body.userId)
			return ERROR.USER_ID_REQUIRED;
		if (!roomId)
			return ERROR.ROOM_ID_REQUIRED;
		try
		{
			const room = await this.findRoom(roomId);
			if (!room)
				return ERROR.ROOM_NOT_FOUND;
			if (room.guestId)
				return ERROR.ROOM_FULL;
			if (room.ownerId === body.userId)
				return ERROR.OWNER_CANNOT_JOIN;
			room.guestId = body.userId;
			room.status = 'playing';
			room.gameStartTime = new Date(Date.now() + 5000);
			await this.roomRepository.save(room);
			return { success: true, roomId: room.id };
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}

	@Delete('leave/:roomId')
	async	roomLeave(@Param('roomId') roomId: string, @Body() body: { userId: string })
	{
		if (!body.userId)
			return ERROR.USER_ID_REQUIRED;
		if (!roomId)
			return ERROR.ROOM_ID_REQUIRED;
		try
		{
			const room = await this.findRoom(roomId);
			if (!room)
				return ERROR.ROOM_NOT_FOUND;
			if (room.ownerId === body.userId)
			{
				await this.roomRepository.delete(room.id);
				return { success: true, message: 'Room deleted' };
			}
			else
				return ERROR.USER_NOT_IN_ROOM;
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}

	@Post('validate-move/:roomId')
	async	validateMove(@Param('roomId') roomId: string, @Body() body: { row: number, col: number, value: number, role: string })
	{
		if (!roomId)
			return ERROR.ROOM_ID_REQUIRED;
		try
		{
			const room = await this.findRoom(roomId);
			if (!room)
				return ERROR.ROOM_NOT_FOUND;
			const isValid = (body.value === room.solvedBoard[body.row][body.col]);
			let isWin = false;
			if (isValid)
			{
				const newBoard = JSON.parse(JSON.stringify(room.currBoard));
				newBoard[body.row][body.col] = body.value;
				room.currBoard = newBoard;
				if (body.role === 'owner')
					room.ownerMoves += 1;
				else
					room.guestMoves += 1;
				isWin = !newBoard.some((row: number[]) => row.includes(0));
			}
			else
			{
				if (body.role === 'owner')
					room.health[0] -= 1;
				else
					room.health[1] -= 1;
			}
			let loser: string | null = null;
			let winner: string | null = null;
			if (!room.health[0])
			{
				loser = 'owner';
				winner = 'guest';
			}
			else if (!room.health[1])
			{
				loser = 'guest';
				winner = 'owner';
			}
			else if (isWin)
			{
				if (room.ownerMoves > room.guestMoves)
				{
					winner = 'owner';
					loser = 'guest';
				}
				else if (room.guestMoves > room.ownerMoves)
				{
					winner = 'guest';
					loser = 'owner';
				}
				else
				{
					winner = body.role;
					loser = body.role === 'owner' ? 'guest' : 'owner';
				}
			}
			await this.roomRepository.save(room);
			return {
				valid: isValid,
				ownerHealth: room.health[0],
				guestHealth: room.health[1],
				loser: loser,
				winner: winner,
				isWin: isWin
			};
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}

	@Post('cleanup-offline-user')
	async	cleanupOfflineUser(@Body() body: { userId: string })
	{
		if (!body.userId)
			return ERROR.USER_ID_REQUIRED;
		try
		{
			const roomsToCleanup = await this.roomRepository.find({
				where: { ownerId: body.userId, status: 'waiting' }
			});
			if (roomsToCleanup.length > 0)
			{
				for (const room of roomsToCleanup)
					await this.roomRepository.delete(room.id);
				return { success: true, message: 'Cleanup complete' };
			}
			return { success: true, message: 'No rooms to cleanup' };
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}

	@Get('game-state/:roomId')
	async	getGameState(@Param('roomId') roomId: string)
	{
		if (!roomId)
			return ERROR.ROOM_ID_REQUIRED;
		try
		{
			const room = await this.findRoom(roomId);
			if (!room)
				return ERROR.ROOM_NOT_FOUND;
			return {
				success: true,
				ownerId: room.ownerId,
				guestId: room.guestId,
				currBoard: room.currBoard,
				health: room.health,
				status: room.status,
				difficulty: room.difficulty,
				gameStartTime: room.gameStartTime,
				ownerMoves: room.ownerMoves,
				guestMoves: room.guestMoves
			};
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}

	@Get('list')
	async	getRoomList()
	{
		try
		{
			const rooms = await this.roomRepository.find();
			const safeRooms = rooms.map((room: Room) => (
			{
				id: room.id,
				difficulty: room.difficulty,
				ownerId: room.ownerId,
				ownerName: room.ownerName,
				guestId: room.guestId,
				status: room.status,
				health: room.health
			}));
			return { success: true, count: safeRooms.length, rooms: safeRooms };
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}

	@Post('heartbeat/:roomId')
	async	heartbeat(@Param('roomId') roomId: string, @Body() body: { userId: string })
	{
		try
		{
			const room = await this.findRoom(roomId);
			if (!room)
				return ERROR.ROOM_NOT_FOUND;
			if (String(room.ownerId) === String(body.userId))
			{
				room.lastHeartbeat = new Date();
				await this.roomRepository.save(room);
				return { success: true };
			}
			else
				return { success: false };
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}
}
