<script lang="ts">
	import { ShipType } from '$lib/const/types';
	import CellStyled from '$lib/components/CellStyled.svelte';
	import { SHIP_SPACES } from '$lib/const/types';

	export let type: ShipType;
</script>

<div class="flex items-center">
	{#if type === ShipType.Carrier}
		{#each Array(SHIP_SPACES[ShipType.Carrier]) as _, i}
			<CellStyled />
		{/each}
	{:else if type === ShipType.Battleship}
		{#each Array(SHIP_SPACES[ShipType.Battleship]) as _, i}
			<CellStyled />
		{/each}
	{:else if type === ShipType.Cruiser}
		{#each Array(SHIP_SPACES[ShipType.Cruiser]) as _, i}
			<CellStyled />
		{/each}
	{:else if type === ShipType.Submarine}
		{#each Array(SHIP_SPACES[ShipType.Submarine]) as _, i}
			<CellStyled />
		{/each}
	{:else}
		{#each Array(SHIP_SPACES[ShipType.Destroyer]) as _, i}
			<CellStyled />
		{/each}
	{/if}
</div>
