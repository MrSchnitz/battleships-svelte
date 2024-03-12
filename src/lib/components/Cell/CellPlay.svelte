<script lang="ts">
	import classNames from "classnames";
	import CellStyled from "$lib/components/Cell/CellStyled.svelte";
	import { SHIP_COLORS, ShipType } from "../../../../common/types";
	import Icon from "@iconify/svelte";
	import Target from "$lib/components/Cell/Target.svelte";
	import Miss from "$lib/components/Cell/Miss.svelte";
	import Hit from "$lib/components/Cell/Hit.svelte";
	import Destroyed from "$lib/components/Cell/Destroyed.svelte";
	import Shoot from "$lib/components/Cell/Shoot.svelte";

	let cellElement: HTMLDivElement;
	let isHovered: boolean = false;

	export let x: number;
	export let y: number;
	export let onClick: (x: number, y: number) => void;
	export let isSelected: boolean | undefined = false;
	export let isHit: boolean | null = null;
	export let isMiss: boolean | null = null;
	export let isDestroyed: boolean | null = null;
	export let shipType: ShipType | null = null;

	function onMouseEnter() {
		isHovered = true;
	}

	function onMouseLeave() {
		isHovered = false;
	}
</script>

<div
	on:mouseenter={onMouseEnter}
	on:mouseleave={onMouseLeave}
	on:click={() => onClick(x, y)}
	bind:this={cellElement}
>
	<CellStyled color={shipType ? SHIP_COLORS[shipType] : ""}>
		{#if isDestroyed}
			<Destroyed />
		{:else if isHit}
			<Hit />
		{:else if isMiss}
			<Miss />
		{:else if isHovered}
			<Target />
		{/if}
	</CellStyled>
</div>

<style>
</style>
