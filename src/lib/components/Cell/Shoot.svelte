<script lang="ts">
</script>

<div class="relative z-[2] shoot" />

<style>
	.shoot {
		width: 2.4vmax;
		height: 2.4vmax;
		border: 0 solid #ffffff;
		border-radius: 50%;
		transform-origin: center center;
		transform: rotate(45deg);
		animation: blow 0.8s ease-in;
		display: none;
	}

	@keyframes blow {
		0% {
			display: block;
		}
		1% {
			border-width: 1.6vmax;
			opacity: 0;
			transform: scale(0);
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
