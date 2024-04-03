<script lang="ts">
	import classNames from "classnames";

    export let yourRoom: string;
    export let onDisconnect: () => void;
</script>

<div class="card p-3 md:p-4 mb-4 flex gap-1 justify-between items-center">
	<h3 class="h5 md:h3">Your room: <strong>{yourRoom}</strong></h3>
	<button
		type="button"
		class={classNames("btn md:!btn-sm py-0.5 px-2 text-sm variant-filled")}
		on:click={onDisconnect}>Disconnect</button
	>
</div>
