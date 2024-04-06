<script lang="ts">
	import PlayBoard from "$lib/components/Board/PlayBoard.svelte";
	import { getContext, onDestroy, onMount, setContext } from "svelte";
	import classNames from "classnames";
	import SocketAPI from "../../../lib/SocketConnection";
	import { getModalStore, getToastStore, ListBox, ListBoxItem } from "@skeletonlabs/skeleton";
	import { ShotEvent } from "../../../../common/types";
	import type { GameStat } from "../../../../common/types";
	import { GAME_BOARD_SIZE, TIMEOUT_INTERVAL, TIMEOUT_TIMER } from "$lib/config/consts";
	import WinGif from "$lib/images/win.gif";
	import LoseGif from "$lib/images/lose.gif";
	import AudioPlayer from "$lib/AudioPlayer";
	import RoomList from "../../../lib/components/Play/RoomList.svelte";
	import PlayHeader from "$lib/components/Play/PlayHeader.svelte";
	import TurnCounter from "$lib/components/Play/TurnCounter.svelte";
	import { fade } from "svelte/transition";
	import GameHeader from "$lib/components/Play/GameHeader.svelte";

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	const { playerNick, board } = getContext("gameSetupContext");
	const isConnectedToRoom = getContext("isConnectedToRoom");

	let nick = sessionStorage.getItem("nick") ?? "";

	let rooms = [];
	let yourRoom: string | null = sessionStorage.getItem("room") ?? null;
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
			SocketAPI.turnEnded($playerNick);
		}
	}

	$: isYourTurn = game?.playerTurn === $playerNick;

	$: $isConnectedToRoom = !!yourRoom;

	$: {
		if (yourRoom) {
			setPlayBoardWidth();
		}
	}

	onMount(() => {
		SocketAPI.onAfterConnect(({ room, data, availableRooms }) => {
			setYourRoom(room);
			game = data;
			rooms = [...availableRooms];

			if (game) {
				setTurnTimeoutInterval(game);
			} else {
				clearTimeoutInterval();
			}
		});
		SocketAPI.onAvailableRooms((fetchedRooms) => {
			rooms = [...fetchedRooms];
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

			if (data.game.playerTurn === $playerNick) {
				toastStore.trigger({
					message: "Your turn"
				});
			}
		});
		SocketAPI.onShoot((res) => {
			setGame(res.game);
		});
		SocketAPI.onPlayerDisconnected(({ room, data, availableRooms }) => {
			console.log("HMMMM");
			toastStore.trigger({ message: "Other player disconnected..." });
			setYourRoom(room);
			game = data;
			rooms = [...availableRooms];
			clearTimeoutInterval();
		});

		SocketAPI.connect();
		SocketAPI.afterConnect({ roomId: yourRoom, nick });
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
		rooms = [];
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
		if (game && game.playerTurn === $playerNick) {
			clearTimeoutInterval();
			playerTurnTimeout = setInterval(() => timer--, TIMEOUT_INTERVAL);
		}
	}

	function setGame(newGame: GameStat | null) {
		if (newGame?.shot && game) {
			game = { ...game, shot: newGame.shot };

			setTimeout(() => {
				playShot(newGame);
				game = { ...newGame, shot: null };
				checkGameWin(newGame);
			}, 2000);
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
			const isYourWin = $playerNick === game.win;

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

	function setYourRoom(room: string | null) {
		yourRoom = room;
		sessionStorage.setItem("room", room ?? "");
	}

	function onCreateRoom() {
		SocketAPI.createRoom({
			nick: $playerNick,
			board: $board
		});
	}

	function onJoinRoom(room) {
		SocketAPI.joinRoom({
			room,
			nick: $playerNick,
			board: $board
		});
	}

	function onClick(x: number, y: number) {
		clearTimeoutInterval();
		SocketAPI.shoot({ nick: $playerNick, shot: { x, y } });
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
						currentShot={!isYourTurn && (game?.shot?.coords ?? null)}
						label="Your ships"
						noActions={true}
						on:dim={setPlayBoardWidth}
					/>
					{#if !!game}
						<PlayBoard
							className={classNames(
								"md:translate-y-0",
								game && isYourTurn ? "translate-y-[-106%]" : "translate-y-0"
							)}
							size={GAME_BOARD_SIZE}
							ships={game ? game.playerData.destroyedShips : []}
							shots={game ? game.playerData.shots : []}
							currentShot={isYourTurn && (game?.shot?.coords ?? null)}
							label={isYourTurn ? "Attack!" : "enemy ships"}
							isActive={isYourTurn || game.win}
							noActions={!game || game.playerTurn !== $playerNick || !!game.win}
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
