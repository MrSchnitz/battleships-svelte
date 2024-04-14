<script lang="ts">
	import classNames from "classnames";

	export let className: string = "";
	export let innerClassName: string = "";

	export let color: string = "";
	export let noBackground: boolean = false;
</script>

<div
	class={classNames(
		"relative w-[3.8vmax] h-[3.8vmax] sm:w-[2.5vmax] sm:h-[2.5vmax] rounded grid place-content-center",
		!noBackground && "cell-styled",
		className
	)}
>
	<div class="absolute w-full h-full flex items-center justify-center">
		<slot />
	</div>
	<div
		class={classNames(
			"absolute z-[1] top-[-0.1vmax] bottom-[-0.1vmax] right-[-0.1vmax] left-[-0.1vmax] rounded-lg",
			innerClassName
		)}
		style="background-color: {color}"
	></div>
</div>

<style>
	.cell-styled {
		background-color: hsl(200, 100%, 50%);
	}
</style>
