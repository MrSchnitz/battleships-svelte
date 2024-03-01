<script lang="ts">
	import classNames from 'classnames';

	export let className: string = "";
</script>

<div class={classNames('cell-styled', className)}><slot /></div>

<style>
	.cell-styled {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 30px;
		height: 30px;
		border: 1px solid #000;
	}
</style>
