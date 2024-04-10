import { Server } from "socket.io";
import Game from "./src/classes/Game.js";
import Player from "./src/classes/Player.js";
import type { Coordinate } from "../common/types.js";
import { IRoom, SocketEvents } from "../common/types.js";
import { randomUUID } from "crypto";

export interface IGameRoom {
	roomName: string;
	game: Game;
}

export default function injectSocketIO(server: any) {
	const io = new Server(server, { cors: { origin: "*" } } as never);

	const rooms: Map<string, IGameRoom> = new Map();
	const disconnectTimeouts = new Map(); // Map of client ID to disconnect timers

	function getAvailableRooms(): IRoom[] {
		return [...rooms.entries()].flatMap(([key, value]) =>
			value.game.players.length < 2 ? { id: key, name: value.roomName } : []
		);
	}

	function getSelectedRoomGame(room: IRoom): Game {
		return rooms.get(room?.id ?? "")?.game ?? null;
	}

	function getRandomRoomId() {
		return randomUUID();
	}

	io.on("connection", (socket) => {
		let room: IRoom | null = null;
		let playerNick = "";
		let board = null;

		socket.on(SocketEvents.AFTER_CONNECT, ({ room: roomPayload, nick }) => {
			playerNick = nick;
			const selectedGame = getSelectedRoomGame(roomPayload);

			if (selectedGame) {
				room = roomPayload;

				if (!socket.rooms.has(room.id)) {
					socket.join(roomPayload.id);
				}

				selectedGame.setPlayerIdByNick(nick, socket.id);

				clearTimeout(disconnectTimeouts.get(nick));
				disconnectTimeouts.delete(nick);
			console.log("RRR", nick)

				io.to(socket.id).emit(SocketEvents.AFTER_CONNECT, {
					room,
					data:
						selectedGame.players.length < 2
							? null
							: selectedGame.getAfterConnectStatsForPlayer(nick),
					availableRooms: selectedGame.players.length < 2 ? getAvailableRooms() : []
				});
			} else {
				io.to(socket.id).emit(SocketEvents.AFTER_CONNECT, {
					room,
					data: null,
					availableRooms: getAvailableRooms()
				});
			}
		});

		socket.on(SocketEvents.APPLY_DISCONNECT, () => {
			const selectedRoom = getSelectedRoomGame(room);

			if (selectedRoom) {
				socket.leave(room.id);
				rooms.delete(room.id);
				io.to(room.id).emit(SocketEvents.PLAYER_DISCONNECTED, {
					room: null,
					data: null,
					availableRooms: getAvailableRooms()
				});
				socket.rooms.delete(room.id);
				room = null;
				io.emit(SocketEvents.AVAILABLE_ROOMS, getAvailableRooms());
			}
		});

		socket.on(SocketEvents.AVAILABLE_ROOMS, () => {
			io.emit(SocketEvents.AVAILABLE_ROOMS, getAvailableRooms());
		});

		socket.on(SocketEvents.DISCONNECT, () => {
			console.log("A user disconnected");
			if (room) {
				// Set a timeout to remove the user from rooms if not reconnected within 15 seconds
				const timeoutId = setTimeout(() => {
					const selectedGame = getSelectedRoomGame(room);

					if (selectedGame) {
						io.to(room.id).emit(SocketEvents.PLAYER_DISCONNECTED, {
							room: null,
							data: null,
							availableRooms: getAvailableRooms()
						});
						socket.rooms.delete(room.id);
						rooms.delete(room.id);
						room = null;
					}
				}, 15000); // 15 seconds

				// Store the disconnect timer for later reference
				disconnectTimeouts.set(playerNick, timeoutId);
			}
		});

		socket.on(SocketEvents.CREATE_ROOM, ({ nick, board: playerBoard }) => {
			room = { id: getRandomRoomId(), name: nick };
			board = playerBoard;
			const game = new Game();
			game.addPlayer(new Player(socket.id, nick, playerBoard));

			rooms.set(room.id, { roomName: room.name, game });

			socket.join(room.id);

			io.to(room.id).emit(SocketEvents.YOUR_ROOM, room);
			io.emit(SocketEvents.AVAILABLE_ROOMS, getAvailableRooms());
		});

		socket.on(SocketEvents.JOIN_ROOM, ({ room: roomPayload, nick, board }) => {
			const selectedGame = getSelectedRoomGame(roomPayload);

			if (selectedGame) {
				room = roomPayload;
				socket.join(room.id);
				selectedGame.addPlayer(new Player(socket.id, nick, board));

				io.to(socket.id).emit(SocketEvents.YOUR_ROOM, room);

				selectedGame.getGamePlayStats().forEach((player) => {
					if (player?.playerData?.id) {
						io.to(player.playerData.id).emit(SocketEvents.ROOM_READY, {
							room,
							game: player
						});
					}
				});

				io.emit(SocketEvents.AVAILABLE_ROOMS, getAvailableRooms());
			}
		});

		socket.on(SocketEvents.SHOOT, ({ nick, shot }: { nick: string; shot: Coordinate }) => {
			const selectedGame = getSelectedRoomGame(room);

			if (selectedGame) {
				selectedGame.play(nick, shot);

				selectedGame.getGamePlayStats().forEach((player) => {
					if (player?.playerData?.id) {
						io.to(player.playerData.id).emit(SocketEvents.SHOOT, {
							room,
							game: player
						});
					}
				});

				if (selectedGame.win) {
					socket.rooms.delete(room.id);
					rooms.delete(room.id);
					room = null;
				}
			}
		});

		socket.on(SocketEvents.TURN_ENDED, (nick: string) => {
			const newGameData = getSelectedRoomGame(room)?.changePlayerTurn(nick) ?? [];

			newGameData.forEach((playerStats) => {
				if (playerStats?.playerData?.id) {
					io.to(playerStats.playerData.id).emit(SocketEvents.TURN_ENDED, {
						room,
						game: playerStats
					});
				}
			});
		});
	});

	console.log("SocketIO injected");
}
