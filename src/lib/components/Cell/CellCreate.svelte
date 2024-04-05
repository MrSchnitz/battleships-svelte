<script lang="ts">
	import classNames from "classnames";
	import CellStyled from "$lib/components/Cell/CellStyled.svelte";
	import type { ShipType } from "../../../../common/types";
	import { SHIP_COLORS } from "../../../../common/types";
	import Duplicated from "$lib/components/Cell/Duplicated.svelte";
	import Delete from "$lib/components/Cell/Delete.svelte";

	let cellElement: HTMLDivElement;
	let isDuplicated: boolean = false;

	export let x: number;
	export let y: number;
	export let dragPosition: {
		top: number | null;
		bottom: number | null;
		left: number | null;
		right: number | null;
	};
	export let shipType: ShipType;
	export let onHover: (coordinates: { x: number; y: number } | null) => void;
	export let onDragHover: (x: number, y: number) => void;
	export let onDragBlur: (x: number, y: number) => void;
	export let onDuplicated: (isDuplicated: boolean) => void;
	export let isActive: boolean | undefined;
	export let isSelected: boolean | undefined;
	export let isDelete: boolean | undefined;

	$: {
		const { left, right, top, bottom, width, height } = cellElement?.getBoundingClientRect() ?? {
			top: 0,
			bottom: 0,
			left: 0,
			right: 0
		};
		const halfWidth = width / 2;
		const halfHeight = height / 2;

		const xCollision =
			left < dragPosition.right - halfWidth && left > dragPosition.left - halfWidth;
		const yCollision =
			top < dragPosition.bottom - halfHeight && top > dragPosition.top - halfHeight;

		if (xCollision && yCollision) {
			onDragHover(x, y);
			if (isSelected && !isDuplicated) {
				isDuplicated = true;
				onDuplicated(true);
			}
		} else {
			if (isActive) {
				onDragBlur(x, y);
			}
			if (isDuplicated) {
				isDuplicated = false;
				onDuplicated(false);
			}
		}
	}

	function onMouseEnter() {
		onHover({ x, y });
	}

	function onMouseLeave() {
		onHover(null);
	}
</script>

<div
	class={classNames("relative")}
	on:mouseenter={onMouseEnter}
	on:mouseleave={onMouseLeave}
	bind:this={cellElement}
	data-shiptype={shipType}
>
	<CellStyled color={isSelected || isActive ? SHIP_COLORS[shipType] : ""}>
		{#if isDuplicated}<Duplicated />{/if}
		{#if !isDuplicated && isSelected && isDelete}
			<Delete />
		{/if}
	</CellStyled>
</div>
