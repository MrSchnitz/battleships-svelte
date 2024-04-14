<script lang="ts">
	import Cell from "../Cell/CellCreate.svelte";
	import classNames from "classnames";
	import ShipCreator from "$lib/components/ShipCreator.svelte";
	import ShipDrag from "$lib/components/ShipDrag.svelte";
	import { create2DArray } from "$lib/utils/create2DArray";
	import { DEFAULT_SHIPS, SHIP_SPACES } from "../../../../common/types";
	import type { Ship, ShipCoordinate, ShipType } from "../../../../common/types";
	import type { ShipDragDimension } from "$lib/config/types";
	import BoardWrapper from "$lib/components/Board/BoardWrapper.svelte";
	import { slide } from "svelte/transition";
	import MediaQuery from "svelte-media-queries";
	import {
		checkIfShipCoordinateMatch,
		checkShipCoordinates,
		findShipByCoordinates
	} from "$lib/utils/utils";

	let SHIPS = DEFAULT_SHIPS;
	let dragPosition: ShipDragDimension = { top: null, bottom: null, left: null, right: null };
	let hoveredCells: ShipCoordinate[] = [];
	let isOnDuplicated: boolean = false;
	let shipToDelete: Ship | null = null;
	let mousePosition: { x: number; y: number } | null = null;
	let isRotated: boolean = false;
	let activeShipType: ShipType | null = null;
	let shipSectionHeight: string = "24vmax";

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
		shipSectionHeight = `${isRotated ? 18 : SHIPS.length * 5}vmax`;
	}

	function onShipDragStart(shipType: ShipType) {
		activeShipType = shipType;
	}

	function onShipDragMove(dragDimension: ShipDragDimension) {
		dragPosition = dragDimension;
	}

	function onShipDragEnd(shipType: ShipType) {
		if (isOnDuplicated) {
			alert("Not allowed here!");
		} else if (hoveredCells.length > 0 && hoveredCells.length === SHIP_SPACES[shipType]) {
			addShip({ type: shipType, coords: hoveredCells, destroyed: false });
		}

		dragPosition = { top: null, bottom: null, left: null, right: null };
		mousePosition = null;
		hoveredCells = [];
		activeShipType = null;
	}

	function onDragHover(x: number, y: number) {
		if (!checkIfShipCoordinateMatch(hoveredCells, { x, y })) {
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

		const foundShip = findShipByCoordinates(selectedShips, coordinates);

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
		if (shipToDelete && confirm("Do you really want to remove ship?")) {
			removeShip(shipToDelete);
			shipToDelete = null;
		}
	});

	function toggleRotated() {
		isRotated = !isRotated;
	}
</script>

<div>
	<div class="flex flex-col sm:flex-row">
		{#if !isGameSet}
			<MediaQuery query="(max-width: 640px)" let:matches>
				<div
					transition:slide={{ duration: 500, axis: matches ? "y" : "x" }}
					class="flex flex-col justify-between p-4 sm:p-0 mb-3 sm:mb-0 md:mr-16"
				>
					<div
						class={classNames(
							"flex items-start md:justify-start gap-2.5 w-[15vmax] transition-[height] duration-300",
							isRotated ? "flex-row justify-start" : "flex-col justify-end"
						)}
						style="height:{matches ? shipSectionHeight : '100%'}"
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
					<button class="mt-4 btn btn-sm variant-filled" on:click={toggleRotated}
						>Rotate ships</button
					>
					<button class="mt-2 btn btn-sm variant-filled-secondary" on:click={randomizeShips}
						>Random set</button
					>
				</div>
			</MediaQuery>
		{/if}
		<div>
			<BoardWrapper {size}>
				{#each cellArray as cell}
					{#each cell as item}
						<Cell
							x={item.x}
							y={item.y}
							shipType={findShipByCoordinates(selectedShips, item)?.type ?? activeShipType}
							{dragPosition}
							isSelected={Boolean(findShipByCoordinates(selectedShips, item))}
							isActive={checkIfShipCoordinateMatch(hoveredCells, item)}
							isDelete={!isOnDuplicated && shipToDelete && checkShipCoordinates(shipToDelete, item)}
							{onDragHover}
							{onDragBlur}
							{onHover}
							{onDuplicated}
						/>
					{/each}
				{/each}
			</BoardWrapper>
		</div>
	</div>
	<slot />
</div>
