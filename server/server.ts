import { Server } from "socket.io";
import Game from "./src/classes/Game";
import Player from "./src/classes/Player";
import { SocketEvents } from "../common/types";
import type { Coordinate } from "../common/types";

export default function injectSocketIO(server: any) {
	const io = new Server(server, { cors: { origin: "*" } } as never);

	const rooms: Map<string, Game> = new Map();
	const disconnectTimeouts = new Map(); // Map of client ID to disconnect timers

	function getAvailableRooms() {
		return [...rooms.entries()].flatMap(([key, value]) => (value.players.length < 2 ? key : []));
	}

	io.on("connection", (socket) => {
		let room = "";
		let playerNick = "";
		let board = null;

		socket.on(SocketEvents.AFTER_CONNECT, ({ roomId, nick }) => {
			playerNick = nick;

			if (roomId && rooms.get(roomId)) {
				room = roomId;
				const selectedRoom = rooms.get(room);

				if (selectedRoom) {
					room = roomId;
					socket.join(room);

					selectedRoom.setPlayerIdByNick(nick, socket.id);

					clearTimeout(disconnectTimeouts.get(nick));
					disconnectTimeouts.delete(nick);

					io.to(socket.id).emit(SocketEvents.AFTER_CONNECT, {
						room,
						data: selectedRoom.players.length < 2 ? null : selectedRoom.getAfterConnectStatsForPlayer(nick),
						availableRooms: selectedRoom.players.length < 2 ? getAvailableRooms() : []
					});
				}
			} else {
				io.to(socket.id).emit(SocketEvents.AFTER_CONNECT, {
					room,
					data: null,
					availableRooms: getAvailableRooms()
				});
			}
		});

		socket.on(SocketEvents.APPLY_DISCONNECT, () => {
			const selectedRoom = [...rooms.keys()].find((r) => r === room);

			if (selectedRoom) {
				socket.leave(selectedRoom);
				rooms.delete(room);
				io.to(selectedRoom).emit(SocketEvents.PLAYER_DISCONNECTED, {
					room: null,
					data: null,
					availableRooms: getAvailableRooms()
				});
				socket.rooms.delete(room);
				room = "";
				io.emit(SocketEvents.AVAILABLE_ROOMS, [...rooms.keys()]);
			}
		});

		socket.on(SocketEvents.AVAILABLE_ROOMS, () => {
			io.emit(SocketEvents.AVAILABLE_ROOMS, [...rooms.keys()]);
		});

		socket.on(SocketEvents.DISCONNECT, () => {
			console.log("A user disconnected");
			if (room) {
				// Set a timeout to remove the user from rooms if not reconnected within 30 seconds
				const timeoutId = setTimeout(() => {
					const selectedRoom = [...rooms.keys()].find((r) => r === room);

					if (selectedRoom) {
						io.to(selectedRoom).emit(SocketEvents.PLAYER_DISCONNECTED);
						socket.rooms.delete(room);
						rooms.delete(room);
					}
				}, 10000); // 30 seconds

				// Store the disconnect timer for later reference
				disconnectTimeouts.set(playerNick, timeoutId);
			}
		});

		socket.on(SocketEvents.CREATE_ROOM, ({ nick, board: playerBoard }) => {
			room = nick;
			board = playerBoard;
			const game = new Game();
			game.addPlayer(new Player(socket.id, nick, playerBoard));

			rooms.set(room, game);

			socket.join(room);

			io.to(room).emit(SocketEvents.YOUR_ROOM, room);
			io.emit(SocketEvents.AVAILABLE_ROOMS, getAvailableRooms());
		});

		socket.on(SocketEvents.JOIN_ROOM, ({ room: roomId, nick, board }) => {
			const selectedRoom = rooms.get(roomId);

			if (selectedRoom) {
				room = roomId;
				socket.join(room);
				selectedRoom.addPlayer(new Player(socket.id, nick, board));

				io.to(socket.id).emit(SocketEvents.YOUR_ROOM, roomId);

				selectedRoom.getGamePlayStats().forEach((player) => {
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
			const selectedRoom = rooms.get(room);

			if (selectedRoom) {
				selectedRoom.play(nick, shot);

				selectedRoom.getGamePlayStats().forEach((player) => {
					if (player?.playerData?.id) {
						io.to(player.playerData.id).emit(SocketEvents.SHOOT, {
							room,
							game: player
						});
					}
				});

				if (selectedRoom.win) {
					socket.rooms.delete(room);
					rooms.delete(room);
					room = ""
				}
			}
		});

		socket.on(SocketEvents.TURN_ENDED, (nick: string) => {
			const newGameData = rooms.get(room)?.changePlayerTurn(nick) ?? [];

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
