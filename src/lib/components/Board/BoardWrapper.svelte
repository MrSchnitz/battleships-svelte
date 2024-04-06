<script lang="ts">
	import classNames from "classnames";
	import { createEventDispatcher, onDestroy, onMount } from "svelte";

	let wrapperRef: HTMLDivElement | null = null;

	export let size: number = 0;
	export let label: string = "";
	export let noActions: boolean = false;
	export let isActive: boolean = true;
	export let className: string = "";

	const dispatch = createEventDispatcher();

	onMount(() => {
		dispatchDimensions();

		window.addEventListener("resize", () => {
			dispatchDimensions();
		});
	});

	onDestroy(() => {
		window.removeEventListener("resize", () => {
			dispatchDimensions();
		});
	});

	function dispatchDimensions() {
		if (wrapperRef) {
			dispatch("dim", wrapperRef.getBoundingClientRect());
		}
	}
</script>

<div
	class={classNames(
		"relative bg-white rounded-lg border-4 border-white transition-all duration-500 delay-[1.5s]",
		noActions && "pointer-events-none",
		!isActive && "opacity-50",
		className
	)}
	bind:this={wrapperRef}
>
	{#if label}
		<h1 class="text-center text-surface-900 text-lg sm:text-2xl my-1 sm:my-2 uppercase">
			{label}
		</h1>
	{/if}
	<div
		class={classNames("relative grid gap-[1px] place-content-center")}
		style="grid-template-columns: repeat({size}, min-content)"
	>
		<slot />
	</div>
</div>
