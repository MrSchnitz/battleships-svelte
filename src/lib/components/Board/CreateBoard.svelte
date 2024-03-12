<script lang="ts">
	import Cell from "../Cell/CellCreate.svelte";
	import classNames from "classnames";
	import ShipCreator from "$lib/components/ShipCreator.svelte";
	import ShipDrag from "$lib/components/ShipDrag.svelte";
	import { create2DArray } from "$lib/util";
	import { DEFAULT_SHIPS, SHIP_SPACES } from "../../../../common/types";
	import type { Ship, ShipCoordinate, ShipType } from "../../../../common/types";
	import type { ShipDragDimension } from "../../config/types";

	let SHIPS = DEFAULT_SHIPS;
	let dragPosition: ShipDragDimension = { top: null, bottom: null, left: null, right: null };
	let hoveredCells: ShipCoordinate[] = [];
	let isOnDuplicated: boolean = false;
	let shipToDelete: Ship | null = null;
	let mousePosition: { x: number; y: number } | null = null;
	let isRotated: boolean = false;
	let activeShipType: ShipType | null = null;

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

	function onShipDragStart(shipType: ShipType) {
		activeShipType = shipType;
	}

	function onShipDragMove(dragDimension: ShipDragDimension) {
		dragPosition = dragDimension;
	}

	function onShipDragEnd(shipType: ShipType) {
		if (isOnDuplicated) {
			alert("Tady to nejde!");
		} else if (hoveredCells.length > 0 && hoveredCells.length === SHIP_SPACES[shipType]) {
			addShip({ type: shipType, coords: hoveredCells, destroyed: false });
		}

		dragPosition = { top: null, bottom: null, left: null, right: null };
		mousePosition = null;
		hoveredCells = [];
		activeShipType = null;
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

	document.addEventListener("mousemove", (event) => {
		if (shipToDelete) {
			mousePosition = {
				x: event.clientX,
				y: event.clientY
			};
		} else if (mousePosition) {
			mousePosition = null;
		}
	});

	document.addEventListener("click", (event) => {
		if (shipToDelete && confirm("Opravdu smazat lod?")) {
			removeShip(shipToDelete);
			shipToDelete = null;
		}
	});

	function toggleRotated() {
		isRotated = !isRotated;
	}
</script>

<div>
	<!--{#if shipToDelete && mousePosition}-->
	<!--	<div class="fixed" style="left: {mousePosition.x}px; top: {mousePosition.y}px">X</div>-->
	<!--{/if}-->
	<div class="flex flex-col sm:flex-row gap-8 sm:gap-16">
		<div class="w-full flex flex-col justify-between">
			<div
				class={classNames(
					"flex items-start gap-3 w-[15vmax] h-[20vmax]",
					isRotated ? "flex-row" : "flex-col"
				)}
			>
				{#each SHIPS as type, i}
					<ShipDrag
						onDragMove={onShipDragMove}
						onDragStart={() => onShipDragStart(type)}
						onDragEnd={() => onShipDragEnd(type)}
					>
						<ShipCreator {type} {isRotated} />
					</ShipDrag>
				{/each}
			</div>
			<button class="mt-4 btn btn-sm variant-filled" on:click={toggleRotated}>Rotate ships</button>
		</div>
		<div
			class={classNames("relative grid gap-[1px] place-content-center")}
			style="grid-template-columns: repeat({size}, min-content)"
		>
			{#each cellArray as cell}
				{#each cell as item}
					<Cell
						x={item.x}
						y={item.y}
						shipType={selectedShips.find((selectedShip) =>
							selectedShip.coords.find((coord) => coord.x === item.x && coord.y === item.y)
						)?.type ?? activeShipType}
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
