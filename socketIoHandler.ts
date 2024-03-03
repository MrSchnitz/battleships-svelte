import { Server } from "socket.io";

enum SocketEvents {
	AVAILABLE_ROOMS = "availableRooms",
	MESSAGE = "message",
	CREATE_ROOM = "createRoom",
	JOIN_ROOM = "joinRoom",
	ROOM_READY = "roomReady",
	YOUR_ROOM = "yourRoom",
	SHOOT = "shoot"
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
	playerOne: Player;
	playerTwo: Player;
	playerTurn: string | null = null;

	constructor(playerOne: Player, playerTwo: Player) {
		this.playerOne = playerOne;
		this.playerTwo = playerTwo;
		this.playerTurn = playerOne.nick;
	}

	public getStatForPlayer(nick: string) {
		const selectedPlayer = this.playerOne.nick === nick ? this.playerOne : this.playerTwo;

		return {
			playerData: selectedPlayer.getData(),
			playerTurn: this.playerTurn
		};
	}

	public play(playerNick: string, shotCoordinate: Coordinate) {
		if (this.playerOne.nick === playerNick) {
			const hit = checkHit(this.playerTwo.ships, shotCoordinate);

			this.playerOne.setShot({
				coords: shotCoordinate,
				hit
			});
			this.playerOne.destroyedShips = checkDestroyedShip(
				this.playerTwo.ships,
				this.playerOne.destroyedShips,
				this.playerOne.shots
			);
			this.playerTwo.checkShips(shotCoordinate);
			this.playerTurn = this.playerTwo.nick;
		} else {
			const hit = checkHit(this.playerOne.ships, shotCoordinate);

			this.playerTwo.setShot({
				coords: shotCoordinate,
				hit
			});
			this.playerTwo.destroyedShips = checkDestroyedShip(
				this.playerOne.ships,
				this.playerTwo.destroyedShips,
				this.playerTwo.shots
			);
			this.playerOne.checkShips(shotCoordinate);
			this.playerTurn = this.playerTwo.nick;
		}
	}
}

export default function injectSocketIO(server: any) {
	const io = new Server(server);

	const rooms: Map<string, Player[]> = new Map();
	const games: Map<string, Game> = new Map();

	io.on("connection", (socket) => {
		let room = "";

		io.emit(SocketEvents.AVAILABLE_ROOMS, [...rooms.keys()]);

		socket.on("disconnect", () => {
			console.log("A user disconnected");
			if (room) {
				const index = rooms.get(room)?.findIndex((r) => r.id === socket.id) ?? -1;
				if (index !== -1) {
					rooms.get(room)?.splice(index, 1);
				}
				if (rooms.get(room)?.length === 0) {
					rooms.delete(room);
				}
				socket.to(room).emit("userDisconnected");
				io.emit(SocketEvents.AVAILABLE_ROOMS, [...rooms.keys()]);
			}
		});

		socket.on(SocketEvents.CREATE_ROOM, ({ nick, board }) => {
			room = nick;
			rooms.set(room, [new Player(socket.id, nick, board)]);

			socket.join(room);
			// rooms.get(room)!.push({id: userId, board});

			io.to(room).emit(SocketEvents.YOUR_ROOM, room);
			io.emit(SocketEvents.AVAILABLE_ROOMS, [...rooms.keys()]);
		});

		socket.on(SocketEvents.JOIN_ROOM, ({ room: roomId, nick, board }) => {
			const selectedRoom = rooms.get(roomId);

			if (selectedRoom && selectedRoom.length === 1) {
				room = roomId;
				socket.join(room);
				selectedRoom.push(new Player(socket.id, nick, board));

				games.set(roomId, new Game(selectedRoom[0], selectedRoom[1]));

				io.to(socket.id).emit(SocketEvents.YOUR_ROOM, roomId);

				console.log("SSS", selectedRoom)

				selectedRoom.forEach((player) => {
					io.to(player.id).emit(SocketEvents.ROOM_READY, {
						room,
						game: games.get(roomId)?.getStatForPlayer(player.nick)
					});
				});
			}
		});

		socket.on(SocketEvents.SHOOT, ({ nick, shot }: { nick: string; shot: Coordinate }) => {
			const game = games.get(room);
			const selectedRoom = rooms.get(room);

			if (selectedRoom) {
				game?.play(nick, shot);

				console.log("RESS", nick, shot, game);

				selectedRoom.forEach((player) => {
					io.to(player.id).emit(SocketEvents.SHOOT, {
						room,
						game: games.get(room)?.getStatForPlayer(player.nick)
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
