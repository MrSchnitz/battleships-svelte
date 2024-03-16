<script lang="ts">
	import PlayBoard from "$lib/components/Board/PlayBoard.svelte";
	import { getContext, onDestroy, onMount } from "svelte";
	import classNames from "classnames";
	import { io } from "$lib/weSocketConnection";
	import { getModalStore, ListBox, ListBoxItem } from "@skeletonlabs/skeleton";
	import { SocketEvents } from "../../../../common/types";
	import { getToastStore } from "@skeletonlabs/skeleton";
	import { GAME_BOARD_SIZE, TIMEOUT_INTERVAL, TIMEOUT_TIMER } from "../../../lib/config/consts";
	import WinGif from "$lib/images/win.gif";
	import LoseGif from "$lib/images/lose.gif";

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	const { playerNick, board } = getContext("gameSetupContext");

	let nick = sessionStorage.getItem("nick") ?? "";

	let rooms = [];
	let yourRoom: string | null = sessionStorage.getItem("room") ?? null;
	let game = null;
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
		io.on(SocketEvents.SHOOT, (res) => {
			setGame(res.game);
		});
		io.on(SocketEvents.AFTER_CONNECT, ({ room, data, availableRooms }) => {
			setYourRoom(room);
			game = data;
			console.log("HMMM", data);
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

	function setGame(newGame: any) {
		game = newGame;
		timer = TIMEOUT_TIMER;

		if (game.win) {
			modalStore.trigger({
				type: "alert",
				title: $playerNick === game.win ? "You are the winner!" : `${game.win} has won!`,
				image: $playerNick === game.win ? WinGif : LoseGif
			});
			clearState();
		}
		// if (newGame && game.playerTurn === $playerNick) {
		// 	playerTurnTimeout = setInterval(() => timer--, TIMEOUT_INTERVAL);
		// }
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
	<div class="card p-4 mb-4 flex flex-col gap-2 sm:flex-row justify-between items-center">
		<h3 class="h3">Your room: <strong>{yourRoom}</strong></h3>
		{#if !game}
			<h4 class="h4 animate-pulse">Waiting for opponent...</h4>
		{/if}
		<button type="button" class={classNames("btn btn-sm variant-filled")} on:click={onDisconnect}
			>Disconnect</button
		>
	</div>
	<div class="flex flex-col sm:flex-row overflow-auto h-full">
		<div class="w-full grid place-content-center">
			<div class="card px-4">
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
							"lg:translate-y-0 transition-[transform] duration-1000",
							game && isYourTurn ? "translate-y-[106%]" : "translate-y-0 relative z-10"
						)}
						size={GAME_BOARD_SIZE}
						ships={game ? game.playerData.ships : $board}
						shots={game ? game.playerData.enemyShots : []}
						label="Your ships"
						noActions={true}
					/>
					<PlayBoard
						className={classNames(
							"lg:translate-y-0 transition-[transform] duration-1000",
							game && isYourTurn ? "translate-y-[-106%]" : "translate-y-0"
						)}
						size={GAME_BOARD_SIZE}
						ships={game ? game.playerData.destroyedShips : []}
						shots={game ? game.playerData.shots : []}
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
