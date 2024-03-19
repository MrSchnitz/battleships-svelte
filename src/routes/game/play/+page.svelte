<script lang="ts">
	import PlayBoard from "$lib/components/Board/PlayBoard.svelte";
	import { getContext, onDestroy, onMount, setContext } from "svelte";
	import classNames from "classnames";
	import { io } from "$lib/weSocketConnection";
	import { getModalStore, getToastStore, ListBox, ListBoxItem } from "@skeletonlabs/skeleton";
	import { SocketEvents, ShotEvent } from "../../../../common/types";
	import type { GameStat } from "../../../../common/types";
	import { GAME_BOARD_SIZE, TIMEOUT_INTERVAL, TIMEOUT_TIMER } from "$lib/config/consts";
	import WinGif from "$lib/images/win.gif";
	import LoseGif from "$lib/images/lose.gif";
	import AudioPlayer from "$lib/AudioPlayer";

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

	$: {
		if (timer <= 0) {
			clearTimeoutInterval();

			toastStore.trigger({
				message: "Your turn ended"
			});
			io.emit(SocketEvents.TURN_ENDED, $playerNick);
		}
	}

	$: isYourTurn = game?.playerTurn === $playerNick;

	$: {
		console.log("GGG", !!yourRoom)
		$isConnectedToRoom = !!yourRoom;
	}

	onMount(() => {
		io.on(SocketEvents.AVAILABLE_ROOMS, (fetchedRooms) => {
			rooms = [...fetchedRooms];
		});
		io.on(SocketEvents.YOUR_ROOM, (room) => {
			setYourRoom(room);
		});
		io.on(SocketEvents.ROOM_READY, (data) => {
			setGame(data.game);
		});
		io.on(SocketEvents.TURN_ENDED, (data) => {
			setYourRoom(data.room);
			setGame(data.game);
		});
		io.on(SocketEvents.SHOOT, (res) => {
			setGame(res.game);
		});
		io.on(SocketEvents.AFTER_CONNECT, ({ room, data, availableRooms }) => {
			setYourRoom(room);
			game = data;
			rooms = [...availableRooms];
			clearTimeoutInterval();
		});

		io.on(SocketEvents.PLAYER_DISCONNECTED, ({ room, data, availableRooms }) => {
			toastStore.trigger({ message: "Other player disconnected..." });
			setYourRoom(room);
			game = data;
			rooms = [...availableRooms];
			clearTimeoutInterval();
		});

		io.emit(SocketEvents.AFTER_CONNECT, { roomId: yourRoom, nick });
	});

	onDestroy(() => {
		io.disconnect();
		io.close();
		clearTimeoutInterval();
	});

	function clearTimeoutInterval() {
		timer = TIMEOUT_TIMER;
		clearInterval(playerTurnTimeout);
		playerTurnTimeout = null;
	}

	function clearState() {
		rooms = [];
		setYourRoom(null);
		game = null;
		playerTurnTimeout = null;
		timer = TIMEOUT_TIMER;
	}

	function setGame(newGame: GameStat | null) {
		if (newGame?.shot && game) {
			game = { ...game, shot: newGame.shot };

			setTimeout(() => {
				switch (newGame?.shot?.type) {
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

				game = { ...newGame, shot: null };

				if (newGame?.win) {
					modalStore.trigger({
						type: "alert",
						title: $playerNick === newGame.win ? "You are the winner!" : `${newGame.win} has won!`,
						image: $playerNick === newGame.win ? WinGif : LoseGif
					});

					if ($playerNick === newGame.win) {
						AudioPlayer.win();
					} else {
						AudioPlayer.lose();
					}
					clearState();
					return;
				}
			}, 1000);
		} else {
			game = newGame;
		}

		if (newGame && newGame.playerTurn === $playerNick) {
			timer = TIMEOUT_TIMER;
			playerTurnTimeout = setInterval(() => timer--, TIMEOUT_INTERVAL);
		}
	}

	function setYourRoom(room: string | null) {
		yourRoom = room;
		sessionStorage.setItem("room", room ?? "");
	}

	function onCreateRoom() {
		console.log("SSS", { userId: $playerNick, board: $board });
		io.emit(SocketEvents.CREATE_ROOM, {
			nick: $playerNick,
			board: $board
		});
	}

	function onJoinRoom(room) {
		io.emit(SocketEvents.JOIN_ROOM, {
			room,
			nick: $playerNick,
			board: $board
		});
	}

	function onDisconnect() {
		io.emit(SocketEvents.APPLY_DISCONNECT);
		setYourRoom(null);
		game = null;
		clearTimeoutInterval();
	}

	function onClick(x: number, y: number) {
		clearTimeoutInterval();
		io.emit(SocketEvents.SHOOT, { nick: $playerNick, shot: { x, y } });
	}
</script>

{#if !yourRoom}
	<div class="h-full w-full grid sm:place-content-center">
		<div class="card w-full sm:w-[40vmax]">
			<header class="card-header"><h3 class="h3">Games</h3></header>
			<section class="p-4">
				<ListBox>
					{#each rooms as room}
						<ListBoxItem name="medium" value={room} on:click={() => onJoinRoom(room)}
							>{room}</ListBoxItem
						>
					{/each}
				</ListBox>
				<button type="button" class="mt-4 w-full btn btn-sm variant-filled" on:click={onCreateRoom}
					>Create room</button
				>
			</section>
		</div>
	</div>
{:else}
	<div
		class="card p-2 md:p-4 mb-4 flex flex-col gap-1 md:gap-2 sm:flex-row justify-between items-center"
	>
		<h3 class="h5 md:h3">Your room: <strong>{yourRoom}</strong></h3>
		{#if !game}
			<h4 class="h6 md:h4 animate-pulse">Waiting for opponent...</h4>
		{/if}
		<button
			type="button"
			class={classNames("btn md:!btn-sm py-0.5 px-2 text-sm variant-filled")}
			on:click={onDisconnect}>Disconnect</button
		>
	</div>
	<div class="flex flex-col sm:flex-row overflow-auto h-full">
		<div class="w-full grid place-content-center">
			<div class="card p-4">
				{#if game}
					<div class="card-header">
						<h3 class="h3 text-center font-bold mb-4">
							{#if isYourTurn}
								Your turn
							{:else}
								Enemy turn
							{/if}
						</h3>
					</div>
				{/if}
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
					/>
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
						isActive={isYourTurn}
						noActions={!game || game.playerTurn !== $playerNick}
						{onClick}
					/>
				</div>
				{#if game}
					<h3
						class={classNames(
							"h3 text-center font-bold mt-4",
							(!isYourTurn || timer > 3) && "invisible"
						)}
					>
						Your turn ends in... {timer}
					</h3>
				{/if}
			</div>
		</div>
	</div>
{/if}
