<script lang="ts">
	import CreateBoard from "$lib/components/Board/CreateBoard.svelte";
	import { getContext } from "svelte";
	import classNames from "classnames";
	import { goto } from "$app/navigation";
	import { GAME_BOARD_SIZE } from "$lib/config/consts";

	const { selectedShips, addShip, removeShip, resetShips, randomizeShips } = getContext("selectedShips");

	const { isGameSet, setBoard } = getContext("gameSetupContext");

	function onResetShips() {
		if (confirm("Do you really want to reset ships?")) {
			resetShips();
		}
	}

	function onPlayClick() {
		setBoard($selectedShips);
		goto("play");
	}
</script>

<div id="create-page-wrapper" class="h-full grid place-content-center">
	<CreateBoard
		size={GAME_BOARD_SIZE}
		selectedShips={$selectedShips}
		{addShip}
		{removeShip}
		{randomizeShips}
		isGameSet={$isGameSet}
	>
		<div
			class={classNames(
				"w-full transition-opacity duration-500",
				!$isGameSet && "opacity-0",
				$isGameSet && "delay-[400ms]"
			)}
		>
			<button
				class={classNames("w-full mt-2 btn btn-sm variant-filled-error")}
				on:click={onResetShips}>Reset</button
			>
			<button
				type="button"
				class={classNames("w-full mt-2 btn variant-filled")}
				on:click={onPlayClick}>Play</button
			>
		</div>
	</CreateBoard>
</div>
