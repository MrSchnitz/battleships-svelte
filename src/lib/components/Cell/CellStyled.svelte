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
	/>
</div>

<style>
	.cell-styled {
		background-color: hsl(200, 100%, 50%);
		/*outline: 0.1vmax solid rgba(255, 255, 255, 1);*/
	}

	.hmm {
		background-image: -webkit-radial-gradient(
			center 0.2vmax,
			1vmax 2vmax,
			#ffffff 60%,
			#0099ff 40%
		);

		background-size: 0.8vmax 3vmax;

		-webkit-text-fill-color: transparent;
		-webkit-animation-name: wave-animation;
		-webkit-animation-duration: 3s;
		-webkit-animation-iteration-count: infinite;
		-webkit-animation-timing-function: linear;
	}

	@keyframes wave-animation {
		0% {
			background-position: 2.5vmax 0;
		}
		50% {
			background-position: 1.5vmax -0.1vmax;
		}
		100% {
			background-position: 2.5vmax 0;
		}
	}
</style>
