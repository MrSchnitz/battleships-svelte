<script lang="ts">
	import Cell from "./CellPlay.svelte";
	import classNames from "classnames";
	import type { Ship } from "$lib/const/types";
	import { create2DArray } from "$lib/util";

	export let size: number = 0;
	export let label: string = "";
	export let noActions: boolean = false;
	export let ships: Ship[] = [];
	export let isHit: boolean = false;
	export let onClick: (x: number, y: number) => void;

	const cellArray = create2DArray(size);

	function findCoordinate(x, y) {
		let foundCoordinate = null;

		return ships.reduce(
			(found, selectedShip) =>
				found ? found : selectedShip.coords.find((coord) => coord.x === x && coord.y === y) ?? null,
			null
		);

		// <!--ships.forEach((selectedShip) => {-->
		// <!--	const fc = selectedShip.coords.find((coord) => coord.x === x && coord.y === y);-->
		//
		// <!--	if (fc) {-->
		// <!--		foundCoordinate = fc;-->
		// <!--	}-->
		// <!--});-->

		// return foundCoordinate;
	}
</script>

<div class={classNames(noActions && "pointer-events-none")}>
	<h1 class="text-center font-mono text-2xl mb-8 uppercase">{label}</h1>
	<div
		class={classNames("relative grid gap-0 place-content-center")}
		style="grid-template-columns: repeat({size}, min-content)"
	>
		{#each cellArray as cell}
			{#each cell as item}
				<Cell
					x={item.x}
					y={item.y}
					isSelected={ships.reduce(
						(found, selectedShip) =>
							found
								? found
								: selectedShip.coords.find((coord) => coord.x === item.x && coord.y === item.y) ??
								  null,
						null
					)}
					isHit={isHit &&
						(ships.reduce(
							(found, selectedShip) =>
								found
									? found
									: selectedShip.coords.find((coord) => coord.x === item.x && coord.y === item.y) ??
									  null,
							null
						)?.hit ??
							null)}
					{onClick}
				/>
			{/each}
		{/each}
	</div>
</div>
