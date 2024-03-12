<script lang="ts">
	import CellStyled from "$lib/components/Cell/CellStyled.svelte";
	import { ShipType, SHIP_SPACES, SHIP_COLORS } from "../../../common/types";
	import classNames from "classnames";

	export let type: ShipType;
	export let isRotated: boolean = false;
</script>

<div class={classNames("flex items-center", isRotated && "flex-col")}>
	{#if type === ShipType.Carrier}
		{#each Array(SHIP_SPACES[ShipType.Carrier]) as _, i}
			<CellStyled color={SHIP_COLORS[ShipType.Carrier]} noBackground={true} />
		{/each}
	{:else if type === ShipType.Battleship}
		{#each Array(SHIP_SPACES[ShipType.Battleship]) as _, i}
			<CellStyled color={SHIP_COLORS[ShipType.Battleship]} noBackground={true} />
		{/each}
	{:else if type === ShipType.Cruiser}
		{#each Array(SHIP_SPACES[ShipType.Cruiser]) as _, i}
			<CellStyled color={SHIP_COLORS[ShipType.Cruiser]} noBackground={true} />
		{/each}
	{:else if type === ShipType.Submarine}
		{#each Array(SHIP_SPACES[ShipType.Submarine]) as _, i}
			<CellStyled color={SHIP_COLORS[ShipType.Submarine]} noBackground={true} />
		{/each}
	{:else}
		{#each Array(SHIP_SPACES[ShipType.Destroyer]) as _, i}
			<CellStyled color={SHIP_COLORS[ShipType.Destroyer]} noBackground={true} />
		{/each}
	{/if}
</div>
