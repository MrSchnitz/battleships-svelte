<script lang="ts">
</script>

<div class="hit hit-1" />
<div class="it hit-2" />
<div class="hit hit-3" />

<style>
	.hit {
		animation: fire 1s ease-in infinite;
		background-image: radial-gradient(#fbff00 20%, rgba(255, 0, 0, 0.78) 80%);
		border-radius: 50%;
		opacity: 0;
		bottom: 0;
		position: absolute;
		width: 80%;
		height: 80%;
		z-index: 2;
	}

	.hit-1 {
		animation-delay: 0.1700849969s;
		left: 0;
	}

	.hit-2 {
		animation-delay: 0.3767041329s;
		left: 16%;
	}

	.hit-3 {
		animation-delay: 0.7914059508s;
		left: 10%;
	}

	@keyframes fire {
		0% {
			opacity: 0;
			transform: translateY(0) scale(1);
		}
		25% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translateY(-100%) scale(0);
		}
	}
</style>
