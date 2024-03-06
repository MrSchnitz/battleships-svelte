<script lang="ts">
	import PlayBoard from "$lib/components/PlayBoard.svelte";
	import { getContext, onMount } from "svelte";
	import classNames from "classnames";
	import { io } from "$lib/weSocketConnection";
	import { ListBox, ListBoxItem } from "@skeletonlabs/skeleton";
	import EnemyPlayBoard from "$lib/components/EnemyPlayBoard.svelte";
	import { SocketEvents } from "../../../../common/types";

	const { playerNick, board } = getContext("gameSetupContext");

	const ARR_SIZE = 10;
	const TIMEOUT = 1000; // ms

	let nick = sessionStorage.getItem("nick") ?? "";

	let rooms = [];
	let yourRoom: string | null = sessionStorage.getItem("room") ?? null;
	let game = null;
	let playerTurnTimeout = null;
	let timer = 10;
	let timeout = false

	function setGame(newGame: any) {
		game = newGame;
		timer = 10;
		if (newGame && game.playerTurn === $playerNick) {
			console.log("SETTT");
			playerTurnTimeout = setInterval(() => {
				console.log("TIMER", timer);
				timer--;
			}, TIMEOUT);
		}
	}

	$: {
		if (timer <= 0) {
			timeout = true
			timer = 10
		}
	}

	onMount(() => {
		io.on(SocketEvents.AVAILABLE_ROOMS, (fetchedRooms) => {
			rooms = [...fetchedRooms];
		});
		io.on(SocketEvents.YOUR_ROOM, (room) => {
			yourRoom = room;
			sessionStorage.setItem("room", room);
		});
		io.on(SocketEvents.ROOM_READY, (data) => {
			setGame(data.game);
			// game = data.game;
		});
		io.on(SocketEvents.SHOOT, (res) => {
			setGame(res.game);
			// game = res.game;
		});
		io.on(SocketEvents.AFTER_CONNECT, ({ room, data, availableRooms }) => {
			console.log("AFTER_CONNECT", room, data, availableRooms);
			yourRoom = room;
			sessionStorage.setItem("room", room);
			game = data;
			rooms = [...availableRooms];
		});

		io.on(SocketEvents.PLAYER_DISCONNECTED, ({ room, data, availableRooms }) => {
			alert("Hrac se odpojil...");
			yourRoom = room;
			sessionStorage.setItem("room", room);
			game = data;
			rooms = [...availableRooms];
		});

		io.emit(SocketEvents.AFTER_CONNECT, { roomId: yourRoom, nick });
	});

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
		yourRoom = null;
		game = null;
	}

	function onClick(x: number, y: number) {
		clearInterval(playerTurnTimeout);
		io.emit(SocketEvents.SHOOT, { nick: $playerNick, shot: { x, y } });
	}
</script>

<div class="h-screen flex">
	<div class="h-full min-w-[200px]">
		<div class="card h-full">
			<h3 class="h3">Nick: <strong>{$playerNick}</strong></h3>
			{#if yourRoom}
				<header class="card-header">
					<h3 class="h3">Your room: <strong>{yourRoom}</strong></h3>
					<button
						type="button"
						class={classNames("mt-2 w-full btn variant-filled")}
						on:click={onDisconnect}>Disconnect</button
					>
				</header>
			{:else}
				<header class="card-header"><h3 class="h3">Players</h3></header>
				<section class="p-4">
					<ListBox>
						{#each rooms as room}
							<ListBoxItem name="medium" value={room} on:click={() => onJoinRoom(room)}
								>{room}</ListBoxItem
							>
						{/each}
					</ListBox>
					<button
						type="button"
						class="mt-4 w-full btn btn-sm variant-filled"
						on:click={onCreateRoom}>Create room</button
					>
				</section>
			{/if}
		</div>
	</div>
	<div class="h-full w-full grid place-content-center">
		{#if game}
			<h2 class="h2 text-center font-bold mb-4">
				{#if game.playerTurn === $playerNick}
					Your turn
				{:else}
					Enemy turn
				{/if}
			</h2>
		{/if}
		<div class="flex items-center gap-x-16">
			<PlayBoard
				size={ARR_SIZE}
				ships={game ? game.playerData.ships : $board}
				enemyShots={game ? game.playerData.enemyShots : []}
				label="Your ships"
				noActions={true}
			/>
			<EnemyPlayBoard
				size={ARR_SIZE}
				shots={game ? game.playerData.shots : []}
				destroyedShips={game ? game.playerData.destroyedShips : []}
				{onClick}
				label="enemy ships"
				noActions={!game || game.playerTurn !== $playerNick}
			/>
		</div>
		{#if game}
			<h2 class="h2 text-center font-bold mt-4">
				{#if game.playerTurn === $playerNick && timer <= 3}
					Your turn ends in... {timer}
				{/if}
			</h2>
		{/if}
	</div>
</div>
