<script lang="ts">
	import classNames from "classnames";
	import { goto } from "$app/navigation";
	import { getContext } from "svelte";

	const { isGameSet, playerNick, setPlayerNick } = getContext("gameSetupContext");

	let nickInput = $playerNick;
	let showContinue = false;

	$: {
		// nickInput = $playerNick
		showContinue = nickInput.length >= 3;
	}

	function onContinueClick() {
		if ($isGameSet) {
			setPlayerNick(nickInput, () => goto("game/play"));
		} else {
			setPlayerNick(nickInput, () => goto("game/create"));
		}
	}
</script>

<div class="h-screen grid place-content-center">
	<div class="min-w-[300px]">
		<label class="label">
			<span>Nick</span>
			<input class="input" type="text" placeholder="Enter your nick" bind:value={nickInput} />
		</label>
		<button
			type="button"
			class={classNames("mt-2 w-full btn variant-filled", !showContinue && "invisible")}
			on:click={onContinueClick}>Continue</button
		>
	</div>
</div>
