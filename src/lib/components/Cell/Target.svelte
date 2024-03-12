<script lang="ts">
	import Icon from "@iconify/svelte";
</script>

<div class="target hidden sm:block">
	<Icon icon="mdi:target" width="2vmax" height="2vmax" />
</div>

<style>
	.target {
		animation: pulse 1s infinite;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
