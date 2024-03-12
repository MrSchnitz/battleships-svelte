<script lang="ts">
	import classNames from "classnames";
	import { create2DArray } from "$lib/util";

	export let size: number = 0;

	const cellArray = create2DArray(size);
</script>

<div
	class={classNames("relative grid gap-[1px] place-content-center")}
	style="grid-template-columns: repeat({size}, min-content); grid-template-rows: repeat({size}, min-content)"
>
	<slot />
</div>
