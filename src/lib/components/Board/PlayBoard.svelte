<script lang="ts">
	import Cell from "../Cell/CellPlay.svelte";
	import classNames from "classnames";
	import { create2DArray } from "$lib/util";
	import type { Ship, Shot } from "../../../../common/types";

	export let size: number = 0;
	export let label: string = "";
	export let noActions: boolean = false;
	export let ships: Ship[] = [];
	export let enemyShots: Shot[] = [];
	export let onClick: (x: number, y: number) => void;

	const cellArray = create2DArray(size);
</script>

<div class={classNames(noActions && "pointer-events-none")}>
	<h1 class="text-center font-mono text-2xl mb-2 sm:mb-8 uppercase">{label}</h1>
	<div
		class={classNames("relative grid gap-[1px] place-content-center")}
		style="grid-template-columns: repeat({size}, min-content)"
	>
		{#each cellArray as cell}
			{#each cell as item}
				<Cell
					x={item.x}
					y={item.y}
					shipType={ships.find((selectedShip) =>
						selectedShip.coords.find((coord) => coord.x === item.x && coord.y === item.y)
					)?.type ?? null}
					isSelected={ships.find((selectedShip) =>
						selectedShip.coords.find((coord) => coord.x === item.x && coord.y === item.y)
					)}
					isHit={enemyShots.some(
						(shot) => shot.coords.x === item.x && shot.coords.y === item.y && shot.hit
					)}
					isMiss={enemyShots.some(
						(shot) => shot.coords.x === item.x && shot.coords.y === item.y && !shot.hit
					)}
					isDestroyed={ships.find(
						(selectedShip) =>
							selectedShip.coords.find((coord) => coord.x === item.x && coord.y === item.y) &&
							selectedShip.destroyed
					)}
					{onClick}
				/>
			{/each}
		{/each}
	</div>
</div>
