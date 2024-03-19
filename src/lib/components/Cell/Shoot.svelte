<script lang="ts">
	import { onMount } from "svelte";
	import AudioPlayer from "$lib/AudioPlayer";

	// onMount(() => {
	// 	AudioPlayer.incoming();
	// });
</script>

<div class="absolute z-[2] top-0 right-0 left-0 bottom-0 cell shoot" />

<style>
	.shoot {
		border: 0 solid #ffffff;
		border-radius: 50%;
		transform-origin: center center;
		transform: rotate(45deg);
		animation: blow 0.8s ease-in 0.2s;
	}

	@keyframes blow {
		0% {
			opacity: 0;
			transform: scale(0);
		}
		1% {
			border-width: 1.6vmax;
		}
		50% {
			opacity: 1;
		}
		80% {
			transform: scale(1.8);
			opacity: 1;
		}
		99% {
			opacity: 0;
			border-width: 0;
			transform: scale(1.8);
		}
		100% {
			/*display: none;*/
		}
	}
</style>
