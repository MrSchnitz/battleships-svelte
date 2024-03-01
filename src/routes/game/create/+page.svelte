<script lang="ts">
	import CreateBoard from "$lib/components/CreateBoard.svelte";
	import { getContext } from "svelte";
	import classNames from "classnames";
	import { goto } from "$app/navigation";

	const { selectedShips, addShip, removeShip } = getContext("selectedShips");

	const { isGameSet, setBoard } = getContext("gameSetupContext");

	const ARR_SIZE = 10;

	function onPlayClick() {
		setBoard($selectedShips)
		goto("play");
	}
</script>

<div class="h-screen grid place-content-center">
	<div class="flex flex-col justify-center items-center gap-x-20">
		<CreateBoard size={ARR_SIZE} selectedShips={$selectedShips} {addShip} {removeShip} />
		<button
			type="button"
			class={classNames("w-full mt-8 btn variant-filled", !$isGameSet && "invisible")}
			on:click={onPlayClick}>Play</button
		>
	</div>
</div>
