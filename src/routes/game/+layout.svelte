<script lang="ts">
	import {derived, writable} from "svelte/store";
	import { onMount, setContext } from "svelte";
	import type { Ship } from "$lib/const/types";
	import { DEFAULT_SHIPS } from "$lib/const/types";

	const selectedShips = writable([]);
	const gameSetup = writable({
		isGameSet: false,
		playerNick: "",
		board: []
	});

	onMount(() => {
		const playerNick = localStorage.getItem("nick") ?? "";
		const board = JSON.parse(localStorage.getItem("board")) ?? [];

		console.log("HMMM", playerNick)

		gameSetup.set({
			isGameSet: false,
			playerNick,
			board
		});
	});

	function addShip(addedShip: Ship) {
		selectedShips.update((arr) => [...arr, addedShip]);
	}

	function removeShip(ship: Ship) {
		selectedShips.update((value) => value.filter((v) => v.type !== ship.type));
	}

	setContext("selectedShips", {
		selectedShips,
		addShip,
		removeShip
	});

	function setIsGameSet(value) {
		gameSetup.update((state) => ({ ...state, isGameSet: value }));
	}

	function setPlayerNick(value, callback) {
		gameSetup.update((state) => ({ ...state, playerNick: value }));
		localStorage.setItem("nick", value);
		callback();
	}

	function setBoard(value) {
		gameSetup.update((state) => ({ ...state, board: value }));
		localStorage.setItem("board", JSON.stringify(value));
	}

	setContext("gameSetupContext", {
		isGameSet: derived(gameSetup, (state) => state.isGameSet),
		playerNick: derived(gameSetup, (state) => state.playerNick),
		board: derived(gameSetup, (state) => state.board),
		setIsGameSet,
		setPlayerNick,
		setBoard
	});

	$: {
		gameSetup.update((state) => ({
			...state,
			isGameSet: DEFAULT_SHIPS.length === $selectedShips.length
		}));
	}

	console.log("PPP", $gameSetup.playerNick)

	// if (window.location.pathname === "/game") {
	// 	if (!$isGameSet) {
	// 		window.location.href = "/game/create"
	// 	} else {
	// 		window.location.href = "/game/play"
	// 	}
	// }
</script>

<div class="w-full">
	<slot />
</div>
