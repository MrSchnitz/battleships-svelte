<script lang="ts">
	import PlayBoard from "$lib/components/PlayBoard.svelte";
	import { getContext, onMount } from "svelte";
	import { io } from "$lib/weSocketConnection";
	import { ListBox, ListBoxItem } from "@skeletonlabs/skeleton";
	import EnemyPlayBoard from "$lib/components/EnemyPlayBoard.svelte";

	enum SocketEvents {
		AVAILABLE_ROOMS = "availableRooms",
		CREATE_ROOM = "createRoom",
		JOIN_ROOM = "joinRoom",
		ROOM_READY = "roomReady",
		YOUR_ROOM = "yourRoom",
		SHOOT = "shoot",
		AFTER_CONNECT = "afterConnect"
	}

	const { playerNick, board } = getContext("gameSetupContext");

	const ARR_SIZE = 10;

	let nick = localStorage.getItem("nick") ?? "";

	let rooms = [];
	let yourRoom = sessionStorage.getItem("room") ?? null;
	let game = null;

	onMount(() => {
		io.on(SocketEvents.AVAILABLE_ROOMS, (fetchedRooms) => {
			console.log("RRRR", fetchedRooms);
			rooms = [...fetchedRooms];
		});
		io.on(SocketEvents.YOUR_ROOM, (room) => {
			console.log("HMMMMM", room);
			yourRoom = room;
			sessionStorage.setItem("room", room);
		});
		io.on(SocketEvents.ROOM_READY, (data) => {
			console.log("GGG", data);
			game = data.game;
		});
		io.on(SocketEvents.SHOOT, (res) => {
			console.log("SHOT", res);
			game = res.game;
		});
		io.on(SocketEvents.AFTER_CONNECT, ({ room, data, availableRooms }) => {
			console.log("AFTER_CONNECT", room, data, availableRooms);
			yourRoom = room;
			sessionStorage.setItem("room", room);
			game = data;
			rooms = [...availableRooms];
		});

		console.log("Your room", yourRoom, nick, $playerNick);
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

	function onClick(x: number, y: number) {
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
	</div>
</div>
