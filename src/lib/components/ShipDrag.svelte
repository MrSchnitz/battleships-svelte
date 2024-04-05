<script lang="ts">
	import classNames from "classnames";
	import type { ShipDragDimension } from "../config/types";

	export let isTransformed = false;
	export let onDragMove: (dragDimension: ShipDragDimension) => void = null;
	export let onDragEnd: () => void;
	export let onDragStart: () => void;

	let doTransform = false;
	let move = false;
	let draggableElement: HTMLDivElement;
	let isHovered: boolean = false;

	function handleMouseMove(event: MouseEvent) {
		draggableElement.style.left = `${event.clientX - draggableElement.offsetWidth / 2}px`;
		draggableElement.style.top = `${event.clientY - draggableElement.offsetHeight / 2}px`;

		const { top, bottom, left, right } = draggableElement.getBoundingClientRect();

		onDragMove({ top, bottom, left, right });
	}

	function handleTouchMove(event: TouchEvent) {
		const touch = event.touches[0];
		const x = touch.pageX;
		const y = touch.pageY;

		draggableElement.style.left = `${x - draggableElement.offsetWidth / 2}px`;
		draggableElement.style.top = `${y - draggableElement.offsetHeight / 2}px`;

		const { top, bottom, left, right } = draggableElement.getBoundingClientRect();

		onDragMove({ top, bottom, left, right });
	}

	document.addEventListener("mousemove", (event) => {
		if (move) {
			event.preventDefault();
			handleMouseMove(event);
		}
	});

	document.addEventListener("mouseup", (event) => {
		if (move && event.button < 2) {
			move = false;
			doTransform = false;
			isHovered = false;

			onDragEnd();
		}
	});

	document.addEventListener("touchmove", (event) => {
		if (move) {
			event.preventDefault();
			handleTouchMove(event);
		}
	});

	document.addEventListener("touchend", (event) => {
		if (move) {
			move = false;
			doTransform = false;
			isHovered = false;
			document.body.style.overflow = "auto";

			onDragEnd();
		}
	});

	function onMouseDown(event) {
		handleMouseMove(event);
		move = true;
		onDragStart();
	}

	function onTouchStart(event) {
		console.log("HMM", event);
		event.preventDefault();
		document.body.style.overflow = "hidden";
		handleTouchMove(event);
		move = true;
		onDragStart();
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
		"max-w-fit cursor-grab transition-colors",
		isTransformed && "rotate-90",
		move && "fixed cursor-grabbing z-10",
	)}
	on:mousedown={onMouseDown}
	on:touchstart={onTouchStart}
	on:mouseover={!move ? onMouseOver : null}
	on:mouseleave={!move ? onMouseLeave : null}
	bind:this={draggableElement}
>
	<slot />
</div>
