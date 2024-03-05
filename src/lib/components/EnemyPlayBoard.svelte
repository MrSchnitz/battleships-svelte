<script lang="ts">
	import Cell from "./CellPlay.svelte";
	import classNames from "classnames";
	import { create2DArray } from "$lib/util";
	import type { Ship, Shot } from "../../../server/socketIoHandler";

	export let size: number = 0;
	export let label: string = "";
	export let noActions: boolean = false;
	export let shots: Shot[] = [];
	export let destroyedShips: Ship[] = [];
	export let onClick: (x: number, y: number) => void;

	const cellArray = create2DArray(size);
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
					isHit={shots.find(
						(shot) => shot.coords.x === item.x && shot.coords.y === item.y && shot.hit
					)}
					isDestroyed={destroyedShips.find((ship) =>
						ship.coords.find((c) => c.x === item.x && c.y === item.y)
					)}
					isMiss={shots.find(
						(shot) => shot.coords.x === item.x && shot.coords.y === item.y && !shot.hit
					)}
					{onClick}
				/>
			{/each}
		{/each}
	</div>
</div>
