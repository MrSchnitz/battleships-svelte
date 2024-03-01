<script lang="ts">
	import Cell from './CellCreate.svelte';
	import classNames from 'classnames';
	import ShipCreator from '$lib/components/ShipCreator.svelte';
	import type {Ship, ShipCoordinates, ShipDragDimension} from '$lib/const/types';
	import { DEFAULT_SHIPS, SHIP_SPACES, ShipType } from '$lib/const/types';
	import ShipDrag from '$lib/components/ShipDrag.svelte';
	import { create2DArray } from '$lib/util';

	let SHIPS = DEFAULT_SHIPS;
	let dragPosition: ShipDragDimension = { top: null, bottom: null, left: null, right: null };
	let hoveredCells: ShipCoordinates[] = [];
	let isOnDuplicated: boolean = false;
	let shipToDelete: Ship | null = null;
	let mousePosition: { x: number; y: number } | null = null;

	export let size: number = 0;
	export let addShip: (ship: Ship) => void = null;
	export let removeShip: (ship: Ship) => void = null;
	export let selectedShips: Ship[] = [];

	const cellArray = create2DArray(size);

	$: {
		SHIPS = DEFAULT_SHIPS.flatMap((ship) =>
			selectedShips.some((selectedShip) => selectedShip.type === ship) ? [] : ship
		);
	}

	function onShipDragMouseMove(dragDimension: ShipDragDimension) {
		dragPosition = dragDimension;
	}

	function onShipDragMouseUp(shipType: ShipType) {
		if (isOnDuplicated) {
			alert('Tady to nejde!');
		} else if (hoveredCells.length > 0 && hoveredCells.length === SHIP_SPACES[shipType]) {
			addShip({ type: shipType, coords: hoveredCells });
		}

		dragPosition = { top: null, bottom: null, left: null, right: null };
		mousePosition = null;
		hoveredCells = [];
	}

	function onDragHover(x: number, y: number) {
		if (!hoveredCells.some((hoveredCell) => hoveredCell.x === x && hoveredCell.y === y)) {
			hoveredCells = [...hoveredCells, { x, y, hit: false }];
		}
	}

	function onDragBlur(x: number, y: number) {
		const foundCellIndex = hoveredCells.findIndex(
			(hoveredCell) => hoveredCell.x === x && hoveredCell.y === y
		);

		if (foundCellIndex >= 0) {
			hoveredCells.splice(foundCellIndex, 1);
			hoveredCells = hoveredCells;
		}
	}

	function onHover(coordinates: { x: number; y: number } | null) {
		if (!coordinates) {
			shipToDelete = null;
			return;
		}

		const { x, y } = coordinates;

		const foundShip = selectedShips.find((selectedShip) =>
			selectedShip.coords.find((coord) => coord.x === x && coord.y === y)
		);

		if (foundShip) {
			shipToDelete = foundShip;
		} else if (shipToDelete) {
			shipToDelete = null;
		}
	}

	function onDuplicated(isDuplicated: boolean) {
		isOnDuplicated = isDuplicated;
	}

	document.addEventListener('mousemove', (event) => {
		if (shipToDelete) {
			mousePosition = {
				x: event.clientX,
				y: event.clientY
			};
		} else if (mousePosition) {
			mousePosition = null;
		}
	});

	document.addEventListener('click', (event) => {
		if (shipToDelete && confirm('Opravdu smazat lod?')) {
			removeShip(shipToDelete);
			shipToDelete = null;
		}
	});
</script>

<div>
	{#if shipToDelete && mousePosition}
		<div class="fixed" style="left: {mousePosition.x}px; top: {mousePosition.y}px">X</div>
	{/if}
	<h1 class="text-center font-mono text-2xl mb-12 uppercase">Deploy your ships</h1>
	<div class="flex gap-x-16">
		<div class="flex flex-col gap-3 justify-center w-[150px]">
			{#each SHIPS as type, i}
				<ShipDrag onMouseMove={onShipDragMouseMove} onMouseUp={() => onShipDragMouseUp(type)}>
					<ShipCreator {type} />
				</ShipDrag>
			{/each}
		</div>
		<div
			class={classNames('relative grid gap-0 place-content-center')}
			style="grid-template-columns: repeat({size}, min-content)"
		>
			{#each cellArray as cell}
				{#each cell as item}
					<Cell
						x={item.x}
						y={item.y}
						{dragPosition}
						isSelected={Boolean(
							selectedShips.find((selectedShip) =>
								selectedShip.coords.find((coord) => coord.x === item.x && coord.y === item.y)
							)
						)}
						isActive={Boolean(hoveredCells.find((c) => c.x === item.x && c.y === item.y))}
						isDelete={Boolean(
							shipToDelete?.coords.find((coord) => coord.x === item.x && coord.y === item.y)
						)}
						{onDragHover}
						{onDragBlur}
						{onHover}
						{onDuplicated}
					/>
				{/each}
			{/each}
		</div>
	</div>
</div>
