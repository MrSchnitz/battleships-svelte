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
		const playerNick = sessionStorage.getItem("nick") ?? "";
		const board = JSON.parse(sessionStorage.getItem("board")) ?? [];

		gameSetup.set({
			isGameSet: board.length > 0,
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
		sessionStorage.setItem("nick", value);
		callback();
	}

	function setBoard(value) {
		gameSetup.update((state) => ({ ...state, board: value }));
		sessionStorage.setItem("board", JSON.stringify(value));
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
</script>

<div class="w-full">
	<slot />
</div>
