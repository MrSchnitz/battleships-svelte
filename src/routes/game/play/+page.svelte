<script lang="ts">
	import PlayBoard from "$lib/components/Board/PlayBoard.svelte";
	import { getContext, onDestroy, onMount } from "svelte";
	import classNames from "classnames";
	import SocketAPI from "../../../lib/SocketConnection";
	import { getModalStore, getToastStore } from "@skeletonlabs/skeleton";
	import type { GameStat, IRoom } from "../../../../common/types";
	import { ShotEvent } from "../../../../common/types";
	import { GAME_BOARD_SIZE, TIMEOUT_INTERVAL, TIMEOUT_TIMER } from "$lib/config/consts";
	import WinGif from "$lib/images/win.gif";
	import LoseGif from "$lib/images/lose.gif";
	import AudioPlayer from "$lib/AudioPlayer";
	import RoomList from "../../../lib/components/Play/RoomList.svelte";
	import PlayHeader from "$lib/components/Play/PlayHeader.svelte";
	import TurnCounter from "$lib/components/Play/TurnCounter.svelte";
	import GameHeader from "$lib/components/Play/GameHeader.svelte";

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	const { playerNick, board } = getContext("gameSetupContext");
	const isConnectedToRoom = getContext("isConnectedToRoom");

	let nick: string = sessionStorage.getItem("nick") ?? "";
	let yourRoom: IRoom | null = JSON.parse(sessionStorage.getItem("room")) ?? null;
	let game: GameStat | null;
	let playerTurnTimeout = null;
	let timer = TIMEOUT_TIMER;
	let isYourTurn = false;
	let playBoardWidth: string = "auto";

	$: {
		if (timer <= -1) {
			clearTimeoutInterval();

			toastStore.trigger({
				message: "Your turn ended"
			});
			SocketAPI.turnEnded(nick);
		}
	}
	$: isYourTurn = game?.playerTurn === nick;
	$: $isConnectedToRoom = !!yourRoom;
	$: document.body.dataset.inGame = String(!!yourRoom);

	onMount(() => {
		SocketAPI.onAfterConnect(({ room, data }) => {
			setYourRoom(room);
			game = data;

			if (game) {
				setTurnTimeoutInterval(game);
			} else {
				clearTimeoutInterval();
			}
		});
		SocketAPI.onYourRoom((room) => {
			setYourRoom(room);
		});
		SocketAPI.onRoomReady((data) => {
			setGame(data.game);
		});
		SocketAPI.onTurnEnded((data) => {
			setYourRoom(data.room);
			setGame(data.game);

			if (data.game.playerTurn === nick) {
				toastStore.trigger({
					message: "Your turn"
				});
			}
		});
		SocketAPI.onShoot((res) => {
			setGame(res.game);
		});
		SocketAPI.onPlayerDisconnected(({ room, data }) => {
			toastStore.trigger({ message: "Other player disconnected..." });
			setYourRoom(room);
			game = data;
			clearTimeoutInterval();
		});

		SocketAPI.connect();
		SocketAPI.afterConnect({ room: yourRoom, nick });
	});

	onDestroy(() => {
		SocketAPI.disconnect();
		clearTimeoutInterval();
	});

	function setPlayBoardWidth(event: CustomEvent) {
		if (event?.detail) {
			const dim: DOMRect = event.detail;
			playBoardWidth = dim?.width ? `${dim.width}px` : "auto";
		}
	}

	function clearState() {
		setYourRoom(null);
		game = null;
		clearTimeoutInterval();
	}

	function clearTimeoutInterval() {
		timer = TIMEOUT_TIMER;
		clearInterval(playerTurnTimeout);
		playerTurnTimeout = null;
	}

	function setTurnTimeoutInterval(game: GameStat | null) {
		if (game && game.playerTurn === nick) {
			clearTimeoutInterval();
			playerTurnTimeout = setInterval(() => timer--, TIMEOUT_INTERVAL);
		}
	}

	function setYourRoom(room: IRoom | null) {
		yourRoom = room;
		sessionStorage.setItem("room", JSON.stringify(room));
	}

	function setGame(newGame: GameStat | null) {
		if (newGame?.shot && game) {
			game = { ...game, shot: newGame.shot };

			setTimeout(() => {
				playShot(newGame);
				game = { ...newGame, shot: null };
				checkGameWin(newGame);
			}, 1000);
		} else {
			game = newGame;
		}

		setTurnTimeoutInterval(newGame);
	}

	function playShot(game: GameStat | null) {
		switch (game?.shot?.type) {
			case ShotEvent.DESTROY:
				AudioPlayer.totalExplosion();
				break;
			case ShotEvent.HIT:
				AudioPlayer.hit();
				break;
			case ShotEvent.MISS:
				AudioPlayer.plop();
				break;
			default:
				break;
		}
	}

	function checkGameWin(game: GameStat | null) {
		if (game?.win) {
			const isYourWin = nick === game.win;

			modalStore.trigger({
				type: "alert",
				title: isYourWin ? "You are the winner!" : `${game.win} has won!`,
				image: isYourWin ? WinGif : LoseGif
			});

			if (isYourWin) {
				AudioPlayer.win();
			} else {
				AudioPlayer.lose();
			}
			clearTimeoutInterval();
			return;
		}
	}

	function onCreateRoom() {
		SocketAPI.createRoom({
			nick,
			board: $board
		});
	}

	function onJoinRoom(room) {
		SocketAPI.joinRoom({
			room,
			nick,
			board: $board
		});
	}

	function onClick(x: number, y: number) {
		clearTimeoutInterval();
		SocketAPI.shoot({ nick, shot: { x, y } });
	}

	function onLeave() {
		if (game?.win) {
			clearState();
		} else {
			if (!confirm("Are you sure you want to leave?")) {
				return;
			}
			SocketAPI.applyDisconnect();
			clearState();
		}
	}
</script>

{#if !yourRoom}
	<RoomList {onCreateRoom} {onJoinRoom} />
{:else}
	<PlayHeader {yourRoom} {onLeave} />
	<div class="flex flex-col sm:flex-row overflow-auto h-full">
		<div class="w-full grid place-content-center">
			<div class="card relative p-4">
				<GameHeader {game} {isYourTurn} {onLeave} />
				<div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
					<PlayBoard
						className={classNames(
							"md:translate-y-0",
							game && isYourTurn ? "translate-y-[106%]" : "translate-y-0 relative z-10"
						)}
						size={GAME_BOARD_SIZE}
						ships={game ? game.playerData.ships : $board}
						shots={game ? game.playerData.enemyShots : []}
						currentShot={!isYourTurn && (game?.shot ?? null)}
						label="Your ships"
						noActions={true}
						on:dim={setPlayBoardWidth}
					/>
					{#if !!game}
						<PlayBoard
							className={classNames(
								"md:translate-y-0",
								game && !game.win && isYourTurn ? "translate-y-[-106%]" : "translate-y-0"
							)}
							size={GAME_BOARD_SIZE}
							ships={game ? game.playerData.destroyedShips : []}
							shots={game ? game.playerData.shots : []}
							currentShot={isYourTurn && (game?.shot ?? null)}
							label={isYourTurn ? "Attack!" : "enemy ships"}
							isActive={isYourTurn || game.win}
							noActions={!game || game.playerTurn !== nick || !!game.win}
							{onClick}
						/>
					{:else}
						<h4 class="h5 sm:h4 text-center animate-pulse" style="min-width: {playBoardWidth}">
							Waiting for opponent...
						</h4>
					{/if}
				</div>
				{#if game && isYourTurn && timer <= 3}
					<TurnCounter {timer} />
				{/if}
			</div>
		</div>
	</div>
{/if}
