<script lang="ts">
	import { fade, scale } from "svelte/transition";
	import { quintOut } from "svelte/easing";

	import type { GameStat } from "../../../../common/types";

	export let game: GameStat | null = null;
	export let isYourTurn: boolean = false;
	export let onLeave: () => void;
</script>

{#if game && !game?.win}
	<div class="card-header">
		<h3 class="relative h3 text-center font-bold mb-4 flex justify-center">
			<span class="invisible">_</span>
			{#if isYourTurn}
				<span
					class="absolute"
					in:scale={{ duration: 500, delay: 1500 }}
					out:scale={{ duration: 300, delay: 1000 }}
				>
					Your turn</span
				>
			{:else}
				<span
					class="absolute"
					in:scale={{ duration: 500, delay: 1500 }}
					out:scale={{ duration: 300, delay: 1000 }}
				>
					Enemy turn</span
				>
			{/if}
		</h3>
	</div>
{:else if !!game?.win}
	<div
		transition:fade={{ duration: 300 }}
		class="card-header mb-4 flex flex-col gap-1 items-center"
	>
		<h3 class="h3 text-center">
			<strong>{game.win}</strong> has won!
		</h3>
		<button class="btn btn-sm variant-filled" on:click={onLeave}>Leave</button>
	</div>
{/if}
