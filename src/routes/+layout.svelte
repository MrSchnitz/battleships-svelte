<script lang="ts">
	import "../app.css";
	import {
		AppRail,
		AppRailAnchor,
		AppRailTile,
		AppShell,
		Modal,
		Toast
	} from "@skeletonlabs/skeleton";

	import { initializeStores } from "@skeletonlabs/skeleton";
	import Icon from "@iconify/svelte";
	import NavItem from "$lib/components/Navigation/NavItem.svelte";
	import { page } from "$app/stores";
	import { clickOutside } from "$lib/utils/clickOutside";
	import SocketAPI from "../lib/SocketConnection";

	initializeStores();

	let isMobileMenuOpen = false;
	let menuElement: HTMLDivElement | null = null;

	function toggleMobileMenuOpen() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	function closeMobileMenu() {
		isMobileMenuOpen = false;
	}

	function checkBeforeRedirect(event) {
		const inGame = document.body.dataset.inGame;
		if (inGame) {
			if (confirm("Are you sure you want to leave?")) {
				SocketAPI.applyDisconnect();
				return;
			}
			event.preventDefault();
			event.stopPropagation();
		}
	}
</script>

<Modal />
<Toast />

<AppShell>
	<svelte:fragment slot="header">
		<nav class="relative bg-surface-800">
			<div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
				<div class="relative flex h-16 items-center justify-between">
					<div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
						<!-- Mobile menu button-->
						<button
							type="button"
							class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
							aria-controls="mobile-menu"
							aria-expanded="false"
							on:click={toggleMobileMenuOpen}
						>
							<span class="absolute -inset-0.5" />
							<span class="sr-only">Open main menu</span>
							<svg
								class="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								aria-hidden="true"
							>
								{#if isMobileMenuOpen}
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								{:else}
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
									/>
								{/if}
							</svg>
						</button>
					</div>
					<div
						class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start"
						on:click={checkBeforeRedirect}
					>
						<div class="flex flex-shrink-0 items-center">
							<Icon icon="majesticons:ship" class="h-8 w-8 text-white" />
							<h2 class="ml-4 h2 font-bold text-white cursor-pointer">
								<a href="/">BattleShips</a>
							</h2>
						</div>
						<div class="hidden sm:ml-6 sm:block" use:clickOutside on:clickOutside={closeMobileMenu}>
							<div class="flex space-x-4">
								<NavItem href="/" title="Home" isActive={$page.url.pathname === "/"} />
								<NavItem href="/game" title="Game" isActive={$page.url.pathname.includes("game")} />
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Mobile menu, show/hide based on menu state. -->
			<div
				class="absolute top-auto bg-surface-800 w-full sm:hidden overflow-hidden transition-[max-height] duration-500"
				id="mobile-menu"
				style="max-height: {isMobileMenuOpen ? `${menuElement?.scrollHeight ?? 0}px` : 0}"
				bind:this={menuElement}
			>
				<div class="space-y-1 px-2 pb-3 pt-2" on:click={checkBeforeRedirect}>
					<NavItem href="/" title="Home" isActive={$page.url.pathname === "/"} />
					<NavItem href="/game" title="Game" isActive={$page.url.pathname.includes("game")} />
				</div>
			</div>
		</nav>
	</svelte:fragment>
	<main class="bg-surface-200 h-full">
		<slot />
	</main>
	<!-- ---- / ---- -->
	<!-- (pageFooter) -->
	<!--	<svelte:fragment slot="footer"-->
	<!--		><footer class="bg-surface-800 p-2 text-xs text-white">-->
	<!--			All rights reserved.-->
	<!--		</footer></svelte:fragment-->
	<!--	>-->
</AppShell>
