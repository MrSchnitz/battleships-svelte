<script lang="ts">
	import { slide } from "svelte/transition";
	import { ListBox, ListBoxItem } from "@skeletonlabs/skeleton";
	import { onMount } from "svelte";
	import SocketAPI from "../../SocketConnection";
	import { quintOut } from "svelte/easing";

	let rooms = [];

	export let onJoinRoom: (room: string) => void;
	export let onCreateRoom: () => void;

	onMount(() => {
		SocketAPI.onAfterConnect((data) => {
			rooms = [...data.availableRooms];
		});
		SocketAPI.onAvailableRooms((fetchedRooms) => {
			rooms = [...fetchedRooms];
		});
	});
</script>

<div class="h-full w-full grid sm:place-content-center">
	<div class="card w-full sm:w-[40vmax]">
		<header class="card-header"><h3 class="h3">Games</h3></header>
		<section class="p-4">
			<ListBox>
				{#each rooms as room}
					<div transition:slide={{ duration: 300, opacity: 1, start: 0.5, easing: quintOut }}>
						<ListBoxItem
							name="medium"
							value={room}
							rounded="border border-surface-800 rounded-token"
							on:click={() => onJoinRoom(room)}>{room}</ListBoxItem
						>
					</div>
				{/each}
			</ListBox>
			<button type="button" class="mt-4 w-full btn btn-sm variant-filled" on:click={onCreateRoom}
				>Create room</button
			>
		</section>
	</div>
</div>

<style>
	section > div > label {
		border: 1px solid black !important;
	}
</style>
