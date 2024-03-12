<script lang="ts">
	import CreateBoard from "$lib/components/Board/CreateBoard.svelte";
	import { getContext } from "svelte";
	import classNames from "classnames";
	import { goto } from "$app/navigation";
	import { GAME_BOARD_SIZE } from "$lib/config/consts";

	const { selectedShips, addShip, removeShip } = getContext("selectedShips");

	const { isGameSet, setBoard } = getContext("gameSetupContext");

	function onPlayClick() {
		setBoard($selectedShips);
		goto("play");
	}
</script>

<div id="create-page-wrapper" class="h-full grid place-content-center">
	<CreateBoard size={GAME_BOARD_SIZE} selectedShips={$selectedShips} {addShip} {removeShip} />
	<button
		type="button"
		class={classNames("w-full mt-8 btn variant-filled", !$isGameSet && "invisible")}
		on:click={onPlayClick}>Play</button
	>
</div>
