import { Server, WebSocket } from 'ws';
import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	ConnectedSocket,
	MessageBody,
	OnGatewayDisconnect
} from '@nestjs/websockets';

const ROOM_LINK = 'http://127.0.0.1:8003/api/room/';

@WebSocketGateway({ path: '/api/play' })
export class AppGateway implements OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	private rooms = new Map<string, Set<WebSocket>>();
	private roomStartTimes = new Map<string, number>();

	private async	fetchGameState(roomId: string)
	{
		const res = await fetch(`${ROOM_LINK}game-state/${roomId}`);
		return res.json();
	}

	private	broadcast(roomClients: Set<WebSocket>, payload: string)
	{
		roomClients.forEach((ws: WebSocket) => {
			if (ws.readyState === ws.OPEN)
				ws.send(payload);
		});
	}

	@SubscribeMessage('join_room')
	async	handleJoinRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: WebSocket)
	{
		if (!this.rooms.has(data.roomId))
			this.rooms.set(data.roomId, new Set());
		const roomClients = this.rooms.get(data.roomId)!;
		roomClients.add(client);
		(client as any).roomId = data.roomId;
		if (roomClients.size === 2 && !this.roomStartTimes.has(data.roomId))
		{
			const startTime = Date.now() + 3000;
			this.roomStartTimes.set(data.roomId, startTime);
			try
			{
				const gameState = await this.fetchGameState(data.roomId);
				gameState.startTime = startTime;
				const payload = JSON.stringify({
					event: 'sync_game',
					gameState: gameState,
					ownerHealth: gameState.health ? gameState.health[0] : 3,
					guestHealth: gameState.health ? gameState.health[1] : 3
				});
				this.broadcast(roomClients, payload);
			}
			catch (error)
			{
				return { success: false, error: error.message };
			}
		}
		else if (roomClients.size <= 2 && this.roomStartTimes.has(data.roomId))
		{
			try
			{
				const gameState = await this.fetchGameState(data.roomId);
				gameState.startTime = this.roomStartTimes.get(data.roomId);
				client.send(JSON.stringify({
					event: 'sync_game',
					gameState: gameState,
					ownerHealth: gameState.health ? gameState.health[0] : 3,
					guestHealth: gameState.health ? gameState.health[1] : 3
				}));
			}
			catch (error)
			{
				return { success: false, error: error.message };
			}
		}
	}

	@SubscribeMessage('move')
	async	handleMove( @MessageBody() data: { roomId: string, role: string, row: number; col: number; value: number; },
		@ConnectedSocket() client: WebSocket )
	{
		try
		{
			const res = await fetch(`${ROOM_LINK}validate-move/${data.roomId}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			if (!res.ok)
				return client.send(JSON.stringify({ event: 'error', message: 'Room service communication error' }));
			const { valid, ownerHealth, guestHealth, loser, winner, isWin } = await res.json();
			const roomClients = this.rooms.get(data.roomId);
			if (roomClients)
			{
				const gameState = await this.fetchGameState(data.roomId);
				if (this.roomStartTimes.has(data.roomId))
					gameState.startTime = this.roomStartTimes.get(data.roomId);
				const payload = JSON.stringify(
				{
					event: 'sync_game',
					gameState: gameState,
					ownerHealth,
					guestHealth,
					valid,
					loser,
					winner,
					isWin,
					moveBy: data.role,
					ownerMoves: gameState.ownerMoves,
					guestMoves: gameState.guestMoves
				});
				this.broadcast(roomClients, payload);
			}
		}
		catch (error)
		{
			client.send(JSON.stringify({ event: 'error', message: 'Room service communication error' }));
		}
	}

	async	handleDisconnect(@ConnectedSocket() client: WebSocket)
	{
		const roomId = (client as any).roomId;
		if (roomId)
		{
			const roomClients = this.rooms.get(roomId);
			if (roomClients)
			{
				roomClients.delete(client);
				console.log('remaining clients:', roomClients.size);
				this.broadcast(roomClients, JSON.stringify({ event: 'player_left' }));
				if (!roomClients.size)
				{
					this.rooms.delete(roomId);
					this.roomStartTimes.delete(roomId);
				}
			}
		}
	}
}
