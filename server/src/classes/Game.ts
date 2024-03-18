import Player from "./Player";
import type { Coordinate, GameStat, IGame, Shot } from "../../../common/types";
import { ShipType, ShotEvent } from "../../../common/types";

export default class Game implements IGame {
	players: Player[];
	playerTurn: string | null;
	win: string | null = null;
	currentShot: Shot | null = null;

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

	public getAfterConnectStatsForPlayer(nick: string): GameStat {
		const selectedPlayer = this.players.find((p) => p.nick === nick);

		return {
			playerData: selectedPlayer?.getData() ?? null,
			playerTurn: this.playerTurn,
			win: this.win,
			shot: null
		};
	}

	public getGamePlayStats(): GameStat[] {
		return this.players.map((player) => ({
			playerData: player.getData(),
			playerTurn: this.playerTurn,
			win: this.win,
			shot: this.currentShot
		}));
	}

	public play(playerNick: string, shotCoordinate: Coordinate) {
		this.currentShot = null;
		const selectedPlayer = this.players.find((p) => p.nick === playerNick);
		const otherPlayer = this.players.find((p) => p.nick !== playerNick);

		if (selectedPlayer && otherPlayer) {
			const shot = otherPlayer.checkShipHit(shotCoordinate);
			selectedPlayer.setShot(shot);
			selectedPlayer.destroyedShips = otherPlayer.getDestroyedShips();

			this.checkWin(selectedPlayer);

			this.playerTurn = [ShotEvent.HIT, ShotEvent.DESTROY].includes(shot.type)
				? selectedPlayer.nick
				: otherPlayer.nick;
			this.currentShot = shot;
		}
	}

	public changePlayerTurn(nick: string) {
		this.currentShot = null;
		this.playerTurn = this.players.find((p) => p.nick !== nick)?.nick ?? null;
		return this.getGamePlayStats();
	}

	public checkWin(player: Player) {
		if (
			Object.keys(ShipType).every((type) =>
				player.destroyedShips.some((ship) => ship.type === type)
			)
		) {
			this.win = player.nick;
		}
	}
}
