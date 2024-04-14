<script lang="ts">
	import Cell from "../Cell/CellPlay.svelte";
	import { create2DArray } from "$lib/utils/create2DArray";
	import type { Ship, Shot } from "../../../../common/types";
	import { ShotEvent } from "../../../../common/types";
	import BoardWrapper from "$lib/components/Board/BoardWrapper.svelte";
	import {
		checkShipCoordinates,
		checkShotCoordinates,
		findShipByCoordinates
	} from "$lib/utils/utils";

	export let size: number = 0;
	export let label: string = "";
	export let className: string = "";
	export let ships: Ship[] = [];
	export let shots: Shot[] = [];
	export let isActive: boolean = true;
	export let noActions: boolean = false;
	export let currentShot: Shot | null = null;
	export let onClick: (x: number, y: number) => void;

	const cellArray = create2DArray(size);
</script>

<BoardWrapper {size} {label} {noActions} {isActive} {className} on:dim>
	{#each cellArray as cell}
		{#each cell as item}
			<Cell
				x={item.x}
				y={item.y}
				shipType={findShipByCoordinates(ships, item)?.type ?? null}
				isShoot={currentShot && checkShotCoordinates(currentShot, item)}
				isHit={shots.some(
					(shot) => checkShotCoordinates(shot, item) && shot.type === ShotEvent.HIT
				)}
				isMiss={shots.some(
					(shot) => checkShotCoordinates(shot, item) && shot.type === ShotEvent.MISS
				)}
				isDestroyed={ships.find(
					(selectedShip) => checkShipCoordinates(selectedShip, item) && selectedShip.destroyed
				)}
				{onClick}
			/>
		{/each}
	{/each}
</BoardWrapper>
