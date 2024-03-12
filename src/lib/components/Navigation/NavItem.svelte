<script lang="ts">
	import classNames from "classnames";

	export let href;
	export let title;
	export let isActive;
</script>

<a
	{href}
	class={classNames(
		"block rounded-md px-3 py-2 text-base sm:text-sm font-medium transition-colors",
		isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
	)}
	aria-current="page">{title}</a
>
