import { Server } from "socket.io";

enum SocketEvents {
	AVAILABLE_ROOMS = "availableRooms",
	CREATE_ROOM = "createRoom",
	JOIN_ROOM = "joinRoom",
	ROOM_READY = "roomReady",
	YOUR_ROOM = "yourRoom",
	SHOOT = "shoot",
	AFTER_CONNECT = "afterConnect"
}

enum ShipType {
	Carrier = "Carrier",
	Battleship = "Battleship",
	Cruiser = "Cruiser",
	Submarine = "Submarine",
	Destroyer = "Destroyer"
}

export const SHIP_SPACES = {
	[ShipType.Carrier]: 5,
	[ShipType.Battleship]: 4,
	[ShipType.Cruiser]: 3,
	[ShipType.Submarine]: 3,
	[ShipType.Destroyer]: 2
} as const;

export type Coordinate = { x: number; y: number };

type ShipCoordinate = Coordinate & { hit: boolean };

export type Ship = { type: ShipType; coords: ShipCoordinate[] };

export type Shot = {
	coords: Coordinate;
	hit: boolean;
};

function checkHit(ships: Ship[], shotCoordinate: Coordinate) {
	return ships.some((s) =>
		s.coords.some((c) => c.x === shotCoordinate.x && c.y === shotCoordinate.y)
	);
}

function checkDestroyedShip(ships: Ship[], destroyedShips: Ship[], shots: Shot[]) {
	const availableShips = ships.flatMap((ship) =>
		destroyedShips.some((destroyedShip) => destroyedShip.type === ship.type) ? [] : ship
	);

	const newShip = availableShips.find((ship) =>
		ship.coords.every((c) => shots.some((s) => s.coords.x === c.x && s.coords.y === c.y))
	);

	return [...destroyedShips, ...(newShip ? [newShip] : [])];
}

type PlayerRoom = {
	socketId: string;
	nick: string;
};

class Player {
	id: string;
	nick: string;
	ships: Ship[];
	shots: Shot[];
	destroyedShips: Ship[];

	constructor(id: string, nick: string, ships: Ship[]) {
		this.id = id;
		this.nick = nick;
		this.ships = ships;
		this.shots = [];
		this.destroyedShips = [];
	}

	setShot(shot: Shot) {
		this.shots.push(shot);
	}

	checkShips(shotCoordinate: Coordinate) {
		this.ships.forEach((ship) => {
			const hitCoordinateIndex = ship.coords.findIndex(
				(c) => c.x === shotCoordinate.x && c.y === shotCoordinate.y
			);

			if (hitCoordinateIndex >= 0) {
				ship.coords[hitCoordinateIndex].hit = true;
			}
		});
	}

	getData() {
		return {
			id: this.id,
			nick: this.nick,
			ships: this.ships,
			shots: this.shots,
			destroyedShips: this.destroyedShips
		};
	}
}

class Game {
	players: Player[];
	playerTurn: string | null;

	constructor() {
		this.players = [];
		this.playerTurn = null;
	}

	addPlayer(player: Player) {
		if (this.players.length < 2) {
			this.players.push(player);

			if (this.players.length === 2) {
				this.playerTurn = this.players[0].nick;
			}
		}
	}

	setPlayerIdByNick(nick: string, id: string) {
		const player = this.players.find((p) => p.nick === nick);

		if (player) {
			player.id = id;
		}
	}

	public getStatForPlayer(nick: string) {
		const selectedPlayer = this.players.find((p) => p.nick === nick);

		return {
			playerData: selectedPlayer?.getData() ?? null,
			playerTurn: this.playerTurn
		};
	}

	public getPlayersStats() {
		return this.players.map((player) => ({
			playerData: player.getData(),
			playerTurn: this.playerTurn
		}));
	}

	public play(playerNick: string, shotCoordinate: Coordinate) {
		const selectedPlayer = this.players.find((p) => p.nick === playerNick);
		const otherPlayer = this.players.find((p) => p.nick !== playerNick);

		if (selectedPlayer && otherPlayer) {
			const selectedPlayerHit = checkHit(otherPlayer.ships, shotCoordinate);

			selectedPlayer.setShot({
				coords: shotCoordinate,
				hit: selectedPlayerHit
			});

			selectedPlayer.destroyedShips = checkDestroyedShip(
				otherPlayer.ships,
				selectedPlayer.destroyedShips,
				selectedPlayer.shots
			);

			otherPlayer.checkShips(shotCoordinate);
			this.playerTurn = selectedPlayerHit ? selectedPlayer.nick : otherPlayer.nick;
		}
	}
}

export default function injectSocketIO(server: any) {
	const io = new Server(server);

	const rooms: Map<string, Game> = new Map();
	const disconnectTimeouts = new Map(); // Map of client ID to disconnect timers
	// const games: Map<string, Game> = new Map();

	io.on("connection", (socket) => {
		let room = "";
		let playerNick = "";
		let board = null;

		socket.on(SocketEvents.AFTER_CONNECT, ({ roomId, nick }) => {
			playerNick = nick;

			console.log("CONNNECT", roomId, nick, rooms);

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
						data: selectedRoom.getStatForPlayer(nick),
						availableRooms: []
					});
				}
			} else {
				io.to(socket.id).emit(SocketEvents.AFTER_CONNECT, {
					room,
					data: null,
					availableRooms: [...rooms.keys()]
				});
				// io.emit(SocketEvents.AVAILABLE_ROOMS, [...rooms.keys()]);
			}
		});

		socket.on("disconnect", () => {
			console.log("A user disconnected");
			if (room) {
				// const index = rooms.get(room)?.findIndex((r) => r.socketId === socket.id) ?? -1;
				// if (index !== -1) {
				// 	rooms.get(room)?.splice(index, 1);
				// }
				// if (rooms.get(room)?.length === 0) {
				// 	rooms.delete(room);
				// }
				socket.to(room).emit("userDisconnected");

				// Set a timeout to remove the user from rooms if not reconnected within 30 seconds
				const timeoutId = setTimeout(() => {
					const selectedRoom = rooms.get(room);

					if (selectedRoom) {
						socket.rooms.delete(room);
						rooms.delete(room);
					}
				}, 30000); // 30 seconds

				// Store the disconnect timer for later reference
				disconnectTimeouts.set(playerNick, timeoutId);
				// io.emit(SocketEvents.AVAILABLE_ROOMS, [...rooms.keys()]);
			}
		});

		socket.on(SocketEvents.CREATE_ROOM, ({ nick, board: playerBoard }) => {
			room = nick;
			board = playerBoard;
			const game = new Game();
			game.addPlayer(new Player(socket.id, nick, playerBoard));

			rooms.set(room, game);

			socket.join(room);
			// rooms.get(room)!.push({id: userId, board});

			io.to(room).emit(SocketEvents.YOUR_ROOM, room);
			io.emit(SocketEvents.AVAILABLE_ROOMS, [...rooms.keys()]);
		});

		socket.on(SocketEvents.JOIN_ROOM, ({ room: roomId, nick, board }) => {
			const selectedRoom = rooms.get(roomId);

			if (selectedRoom) {
				room = roomId;
				socket.join(room);
				selectedRoom.addPlayer(new Player(socket.id, nick, board));

				// games.set(roomId, new Game(selectedRoom[0], selectedRoom[1]));

				io.to(socket.id).emit(SocketEvents.YOUR_ROOM, roomId);

				console.log("SSS", selectedRoom);

				selectedRoom.getPlayersStats().forEach((player) => {
					io.to(player.playerData.id).emit(SocketEvents.ROOM_READY, {
						room,
						game: player
					});
				});
			}
		});

		socket.on(SocketEvents.SHOOT, ({ nick, shot }: { nick: string; shot: Coordinate }) => {
			// const game = games.get(room);
			const selectedRoom = rooms.get(room);

			if (selectedRoom) {
				selectedRoom.play(nick, shot);

				console.log("RESS", nick, shot, selectedRoom);

				selectedRoom.getPlayersStats().forEach((player) => {
					io.to(player.playerData.id).emit(SocketEvents.SHOOT, {
						room,
						game: player
					});
				});
			}
		});
	});

	// io.on('connection', (socket) => {
	//     let room: string = "";
	//     for (const [roomId, users] of rooms.entries()) {
	//         if (users.length < 2) {
	//             room = roomId;
	//             break;
	//         }
	//     }
	//     if (!room) {
	//         room = generateRoomId();
	//         rooms.set(room, []);
	//     }
	//
	//     // Join the room
	//     socket.join(room);
	//     rooms.get(room).push(socket.id);
	//
	//     // Notify other user in the room about the new user
	//     const usersInRoom = rooms.get(room);
	//     if (usersInRoom.length === 2) {
	//         io.to(room).emit('roomReady', room);
	//     }
	//
	//     socket.on('disconnect', () => {
	//         console.log('A user disconnected');
	//         const index = rooms.get(room).indexOf(socket.id);
	//         if (index !== -1) {
	//             rooms.get(room).splice(index, 1);
	//         }
	//         if (rooms.get(room).length === 0) {
	//             rooms.delete(room);
	//         }
	//         socket.to(room).emit('userDisconnected');
	//     })
	//
	//     socket.on('message', (message) => {
	//         io.to(room).emit('message', message);
	//     });
	//
	//     socket.on(SocketEvents.CREATE_ROOM, () => {
	//
	//     })
	// });

	console.log("SocketIO injected");
}
