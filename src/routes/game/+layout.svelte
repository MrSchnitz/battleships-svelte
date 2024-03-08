<script lang="ts">
	import { derived, writable } from "svelte/store";
	import { onMount, setContext } from "svelte";
	import type { Ship } from "../../../common/types";
	import { DEFAULT_SHIPS } from "../../../common/types";
	import { AppRail, AppRailAnchor, AppRailTile, AppShell } from "@skeletonlabs/skeleton";
	import Icon from "@iconify/svelte";
	import { page } from "$app/stores";

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

	console.log("PPP", $page.url.pathname);
</script>

<AppShell>
	<svelte:fragment slot="sidebarLeft"
		><AppRail>
			<AppRailAnchor href="/game" selected={$page.url.pathname === "/game"}>
				<svelte:fragment slot="lead"
					><Icon icon="fe:user" class="text-[32px]" /></svelte:fragment
				>
				<span>Setup nick</span>
			</AppRailAnchor>

			<AppRailAnchor href="/game/create" selected={$page.url.pathname === "/game/create"}>
				<svelte:fragment slot="lead"><Icon icon="fe:map" class="text-[32px]" /></svelte:fragment>
				<span>Create board</span>
			</AppRailAnchor>

			{#if $gameSetup.isGameSet}
				<AppRailAnchor href="/game/play" selected={$page.url.pathname === "/game/play"}>
					<svelte:fragment slot="lead"
						><Icon icon="fe:gamepad" class="text-[32px]" /></svelte:fragment
					>
					<span>Play</span>
				</AppRailAnchor>
			{/if}
			<svelte:fragment slot="trail">
				<AppRailAnchor href="/" target="_blank" title="Account">(icon)</AppRailAnchor>
			</svelte:fragment>
		</AppRail></svelte:fragment
	>
	<slot />
</AppShell>
