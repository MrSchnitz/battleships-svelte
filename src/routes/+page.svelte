<script>
	import { ROUTES } from "$lib/routes.ts";
</script>

<div class="relative grid place-content-center h-full bg-image">
	<div class="absolute top-0 bottom-0 right-0 left-0 bg-[hsla(0,0%,0%,0.50)]" />
	<div class="relative isolate px-6 pt-14 lg:px-8">
		<div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
			<div class="text-center">
				<h1 class="text-4xl font-bold tracking-tight sm:text-6xl text-white">
					Welcome to Battleships!
				</h1>
				<p class="mt-4 text-lg sm:text-2xl leading-8 text-gray-200">
					Multiplayer online strategy type guessing game for 2 players.
				</p>
				<a href={ROUTES.GAME} class="mt-6 btn btn-lg variant-filled">Play the game!</a>
			</div>
		</div>
	</div>
</div>

<style>
	.bg-image {
		background-image: url("$lib/images/bt_bg4.jpg");
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}
</style>
