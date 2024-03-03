<script lang="ts">
	import "../app.css";
	import { AppRail, AppRailAnchor, AppRailTile, AppShell } from "@skeletonlabs/skeleton";

	let currentTile: number = 0;
</script>

<AppShell>
	<svelte:fragment slot="header">
		<div class="flex items-center gap-x-4 p-4">
			<h2 class="h2 font-bold">BattleShips</h2>
			<h4 class="h4"><a href="/">Home</a></h4>
			<h4 class="h4"><a href="/game">Game</a></h4>
		</div>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft"
		><AppRail>
			<svelte:fragment slot="lead">
				<AppRailAnchor href="/">(icon)</AppRailAnchor>
			</svelte:fragment>
			<!-- --- -->
			<AppRailTile bind:group={currentTile} name="tile-1" value={0} title="tile-1">
				<svelte:fragment slot="lead">(icon)</svelte:fragment>
				<span>Tile 1</span>
			</AppRailTile>
			<AppRailTile bind:group={currentTile} name="tile-2" value={1} title="tile-2">
				<svelte:fragment slot="lead">(icon)</svelte:fragment>
				<span>Tile 2</span>
			</AppRailTile>
			<AppRailTile bind:group={currentTile} name="tile-3" value={2} title="tile-3">
				<svelte:fragment slot="lead">(icon)</svelte:fragment>
				<span>Tile 3</span>
			</AppRailTile>
			<!-- --- -->
			<svelte:fragment slot="trail">
				<AppRailAnchor href="/" target="_blank" title="Account">(icon)</AppRailAnchor>
			</svelte:fragment>
		</AppRail></svelte:fragment
	>
	<!-- (sidebarRight) -->
	<!-- (pageHeader) -->
	<!-- Router Slot -->
	<slot />
	<!-- ---- / ---- -->
	<!-- (pageFooter) -->
	<svelte:fragment slot="footer">Footer</svelte:fragment>
</AppShell>
