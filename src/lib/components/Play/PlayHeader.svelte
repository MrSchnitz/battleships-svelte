<script lang="ts">
	import classNames from "classnames";
	import type { IRoom } from "../../../../common/types";

	export let yourRoom: IRoom | null = null;
	export let onLeave: () => void | null = null;
</script>

<div class="card p-3 mb-4 flex gap-1 justify-between items-center">
	<h3 class="h5 md:h4">Your room: <strong>{yourRoom?.name ?? ""}</strong></h3>
	<button
		type="button"
		class={classNames("btn md:!btn-sm py-0.5 px-2 text-sm variant-filled")}
		on:click={onLeave}
	>
		Leave
	</button>
</div>
