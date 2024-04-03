<script lang="ts">
	import classNames from "classnames";

	export let isVisible: boolean;
	export let timer: number;
</script>

<h3 class={classNames("h3 text-center font-bold mt-4", !isVisible && "invisible")}>
	Your turn ends in... {timer}
</h3>
