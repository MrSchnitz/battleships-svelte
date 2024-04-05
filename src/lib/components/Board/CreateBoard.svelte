<script lang="ts">
	import Cell from "../Cell/CellCreate.svelte";
	import classNames from "classnames";
	import ShipCreator from "$lib/components/ShipCreator.svelte";
	import ShipDrag from "$lib/components/ShipDrag.svelte";
	import { create2DArray } from "$lib/util";
	import { DEFAULT_SHIPS, SHIP_SPACES } from "../../../../common/types";
	import type { Ship, ShipCoordinate, ShipType } from "../../../../common/types";
	import type { ShipDragDimension } from "../../config/types";
	import BoardWrapper from "$lib/components/Board/BoardWrapper.svelte";
	import { slide, fade } from "svelte/transition";
	import { quintOut } from "svelte/easing";

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
	export let randomizeShips: () => void = null;
	export let selectedShips: Ship[] = [];
	export let isGameSet: boolean = true;

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

		if (foundShip && !activeShipType) {
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
	<div class="flex flex-col sm:flex-row gap-3 sm:gap-16">
		{#if !isGameSet}
			<div
				transition:slide={{ duration: 500, delay: 100, axis: "x" }}
				class="flex flex-col justify-between p-4 sm:p-0"
			>
				<div
					class={classNames(
						"flex items-start gap-2.5 w-[15vmax] h-[24vmax] md:h-full",
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
				<button class="mt-4 btn btn-sm variant-filled-primary" on:click={toggleRotated}
					>Rotate ships</button
				>
				<button class="mt-2 md:mb-24 btn btn-sm variant-filled-secondary" on:click={randomizeShips}
					>Random set</button
				>
			</div>
		{/if}
		<div>
			<BoardWrapper {size}>
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
							isDelete={!isOnDuplicated &&
								Boolean(
									shipToDelete?.coords.find((coord) => coord.x === item.x && coord.y === item.y)
								)}
							{onDragHover}
							{onDragBlur}
							{onHover}
							{onDuplicated}
						/>
					{/each}
				{/each}
			</BoardWrapper>
			<slot />
		</div>
	</div>
</div>
