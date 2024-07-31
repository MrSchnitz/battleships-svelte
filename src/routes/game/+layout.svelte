<script lang="ts">
	import { derived, writable } from "svelte/store";
	import { onMount, setContext } from "svelte";
	import type { Ship } from "../../../common/types";
	import { DEFAULT_SHIPS } from "../../../common/types";
	import { AppBar, AppRail, AppRailAnchor } from "@skeletonlabs/skeleton";
	import Icon from "@iconify/svelte";
	import { page } from "$app/stores";
	import classNames from "classnames";
	import { GAME_BOARD_SIZE } from "$lib/config/consts";
	import { placeShipsRandomly } from "$lib/utils/placeShipsRandomly";
	import { goto } from "$app/navigation";
	import { ROUTES } from "$lib/routes";

	const selectedShips = writable([]);
	const gameSetup = writable({
		isGameSet: false,
		playerNick: "",
		board: []
	});
	const isConnectedToRoom = writable(false);

	onMount(() => {
		const playerNick = sessionStorage.getItem("nick") ?? "";
		const board = JSON.parse(sessionStorage.getItem("board")) ?? [];
		$selectedShips = board;

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
	function resetShips() {
		selectedShips.set([]);
		sessionStorage.setItem("board", JSON.stringify([]));
	}
	function randomizeShips() {
		const randomShips = placeShipsRandomly(GAME_BOARD_SIZE);
		selectedShips.set(randomShips);
	}
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
	setContext("selectedShips", {
		selectedShips,
		addShip,
		removeShip,
		resetShips,
		randomizeShips
	});
	setContext("isConnectedToRoom", isConnectedToRoom);

	$: {
		gameSetup.update((state) => ({
			...state,
			isGameSet: DEFAULT_SHIPS.length === $selectedShips.length
		}));
	}

	$: {
		setTimeout(() => {
			switch ($page.url.pathname) {
				case ROUTES.GAME_CREATE:
					if (!$gameSetup.playerNick) {
						goto(ROUTES.GAME);
					}
					break;
				case ROUTES.GAME_PLAY:
					if (!$gameSetup.isGameSet) {
						if (!$gameSetup.playerNick) {
							goto(ROUTES.GAME);
						}
						goto(ROUTES.GAME_CREATE);
					}
					break;
				default:
					break;
			}
		}, 0);
	}
</script>

<div class="relative h-full">
	<div class="absolute left-0 top-0 h-full">
		<AppRail
			width={`transition-[width] duration-500 md:[&_*]:whitespace-nowrap ${
				$isConnectedToRoom ? "w-0" : "h-full w-12 sm:w-24"
			}`}
		>
			<AppRailAnchor href={ROUTES.GAME} selected={$page.url.pathname === ROUTES.GAME}>
				<svelte:fragment slot="lead"
					><Icon icon="fe:user" class="text-2xl sm:text-4xl" /></svelte:fragment
				>
				<span>Setup nick</span>
			</AppRailAnchor>

			{#if $gameSetup.playerNick}
				<AppRailAnchor
					href={ROUTES.GAME_CREATE}
					selected={$page.url.pathname === ROUTES.GAME_CREATE}
				>
					<svelte:fragment slot="lead"
						><Icon icon="fe:map" class="text-2xl sm:text-4xl" /></svelte:fragment
					>
					<span>Create board</span>
				</AppRailAnchor>
			{/if}

			{#if $gameSetup.isGameSet}
				<AppRailAnchor href={ROUTES.GAME_PLAY} selected={$page.url.pathname === ROUTES.GAME_PLAY}>
					<svelte:fragment slot="lead"
						><Icon icon="fe:gamepad" class="text-2xl sm:text-4xl" /></svelte:fragment
					>
					<span>Play</span>
				</AppRailAnchor>
			{/if}
		</AppRail>
	</div>
	<div
		class={classNames(
			"h-full w-full pl-12 sm:pl-24 flex flex-col transition-[padding] duration-500",
			$isConnectedToRoom && "!p-0"
		)}
	>
		<AppBar padding="px-3 py-2 md:p-4">
			<svelte:fragment slot="lead">
				{#if $page.url.pathname === ROUTES.GAME}
					<h1 class="text-center md:text-xl uppercase">Setup nick</h1>
				{:else if $page.url.pathname === ROUTES.GAME_CREATE}
					<h1 class="text-center md:text-xl uppercase">Deploy your ships</h1>
				{:else}
					<h1 class="text-center md:text-xl uppercase">Play</h1>
				{/if}
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<h3 class="h4"><strong>{$gameSetup.playerNick}</strong></h3>
			</svelte:fragment>
		</AppBar>
		<slot />
	</div>
</div>
