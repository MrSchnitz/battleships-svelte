<script lang="ts">
	import classNames from 'classnames';
	import type { ShipDragDimension } from '$lib/const/types';

	let doTransform = false;
	let move = false;
	let draggableElement: HTMLDivElement;
	let isHovered: boolean = false;

	export let onMouseMove: (dragDimension: ShipDragDimension) => void = null;
	export let onMouseUp: () => void;

	function handleMouseMove(event: MouseEvent) {
		draggableElement.style.left = `${event.clientX - draggableElement.offsetWidth / 2}px`;
		draggableElement.style.top = `${event.clientY - draggableElement.offsetHeight / 2}px`;

		const { top, bottom, left, right } = draggableElement.getBoundingClientRect();

		onMouseMove({ top, bottom, left, right });
	}

	document.addEventListener(
		'contextmenu',
		(event) => {
			if (move) {
				event.preventDefault();
				event.stopPropagation();
				doTransform = !doTransform;
				requestAnimationFrame(() => handleMouseMove(event))
			}
		},
		{ capture: true }
	);

	document.addEventListener('mousemove', (event) => {
		if (move) {
			event.preventDefault();
			handleMouseMove(event);
		}
	});

	document.addEventListener('mouseup', (event) => {
		if (move && event.button < 2) {
			move = false;
			doTransform = false;
			isHovered = false;

			onMouseUp();
		}
	});

	function onMouseDown(event) {
		handleMouseMove(event);
		move = true;
	}

	function onMouseOver() {
		isHovered = true;
	}

	function onMouseLeave() {
		isHovered = false;
	}
</script>

<div
	class={classNames(
		'max-w-fit cursor-grab transition-colors',
		doTransform && 'rotate-90',
		move && 'fixed cursor-grabbing',
		isHovered && 'ring-4 ring-inset ring-violet-500'
	)}
	on:mousedown={onMouseDown}
	on:mouseover={!move ? onMouseOver : null}
	on:mouseleave={!move ? onMouseLeave : null}
	bind:this={draggableElement}
>
	<slot />
</div>
