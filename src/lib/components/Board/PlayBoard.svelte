<script lang="ts">
	import Cell from "../Cell/CellPlay.svelte";
	import { create2DArray } from "$lib/utils/create2DArray";
	import type { Coordinate, Ship, Shot } from "../../../../common/types";
	import BoardWrapper from "$lib/components/Board/BoardWrapper.svelte";
	import { ShotEvent } from "../../../../common/types";

	export let size: number = 0;
	export let label: string = "";
	export let className: string = "";
	export let ships: Ship[] = [];
	export let shots: Shot[] = [];
	export let isActive: boolean = true;
	export let noActions: boolean = false;
	export let currentShot: Coordinate | null = null;
	export let onClick: (x: number, y: number) => void;

	const cellArray = create2DArray(size);
</script>

<BoardWrapper {size} {label} {noActions} {isActive} {className} on:dim>
	{#each cellArray as cell}
		{#each cell as item}
			<Cell
				x={item.x}
				y={item.y}
				shipType={ships.find((selectedShip) =>
					selectedShip.coords.find((coord) => coord.x === item.x && coord.y === item.y)
				)?.type ?? null}
				isShoot={currentShot && currentShot.x === item.x && currentShot.y === item.y}
				isHit={shots.some(
					(shot) =>
						shot.coords.x === item.x && shot.coords.y === item.y && shot.type === ShotEvent.HIT
				)}
				isMiss={shots.some(
					(shot) =>
						shot.coords.x === item.x && shot.coords.y === item.y && shot.type === ShotEvent.MISS
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
</BoardWrapper>
