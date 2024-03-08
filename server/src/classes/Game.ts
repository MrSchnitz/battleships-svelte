import Player from "./Player";
import type { Coordinate } from "../../../common/types";

export default class Game {
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
			const shot = otherPlayer.checkShipHit(shotCoordinate);

			selectedPlayer.setShot(shot);
			selectedPlayer.destroyedShips = otherPlayer.getDestroyedShips();

			this.playerTurn = shot.hit ? selectedPlayer.nick : otherPlayer.nick;
		}
	}

	public changePlayerTurn(nick: string) {
		this.playerTurn = this.players.find((p) => p.nick !== nick)?.nick ?? null;
		return this.getPlayersStats()
	}
}
