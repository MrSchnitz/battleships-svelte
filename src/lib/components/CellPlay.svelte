<script lang="ts">
	import classNames from "classnames";
	import CellStyled from "$lib/components/CellStyled.svelte";

	let cellElement: HTMLDivElement;
	let isHovered: boolean = false;

	export let x: number;
	export let y: number;
	export let onClick: (x: number, y: number) => void;
	export let isSelected: boolean | undefined;
	export let isHit: boolean | null = null;
	export let isMiss: boolean | null = null;

	function onMouseEnter() {
		isHovered = true;
	}

	function onMouseLeave() {
		isHovered = false;
	}
</script>

<div
	class={classNames("cell", {
		"cell--selected": isHovered || isSelected,
		"cell--hit": isHit,
		"cell--miss": isMiss
	})}
	on:mouseenter={onMouseEnter}
	on:mouseleave={onMouseLeave}
	on:click={() => onClick(x, y)}
	bind:this={cellElement}
>
	<CellStyled />
</div>

<style>
	.cell--selected {
		outline: 3px solid green;
		cursor: pointer;
	}
	.cell--hit {
		outline: 3px solid red;
		cursor: pointer;
	}
	.cell--miss {
		outline: 3px solid yellow;
		cursor: pointer;
	}
</style>
