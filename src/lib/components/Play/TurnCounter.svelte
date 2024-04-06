<script lang="ts">
	import { scale } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import { ProgressRadial } from "@skeletonlabs/skeleton";

	export let timer: number;

	let value = 0;
	let initTimer = timer;

	$: value = 100 - (timer / initTimer) * 100;
</script>

<div
	transition:scale={{ duration: 500, opacity: 1, easing: quintOut }}
	class="absolute z-[100] top-[35%] md:top-[50%] left-[50%] translate-x-[-50%] translate-y-[-65%] md:translate-y-[-50%] text-center italic font-bold [&_*]:text-9xl pointer-events-none"
>
	<ProgressRadial {value}>
		{timer}
	</ProgressRadial>
</div>
