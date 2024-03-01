<script lang="ts">
	import '../app.css';
	import { AppShell, Burger, Flex, Header, Navbar, ShellSection } from '@svelteuidev/core';

	let opened = false;
</script>

<AppShell>
	<Navbar>
		<Flex justify="left" gap="lg" align="center">
			<Burger {opened} on:click={() => (opened = !opened)} />
			<Header className="text-3xl">BattleShips</Header>
			<ShellSection><a href="/">Home</a></ShellSection>
			<ShellSection><a href="/game">Game</a></ShellSection>
		</Flex>
	</Navbar>
	<slot />
</AppShell>

<style>
	.header {
		font-weight: bold;
	}
</style>
