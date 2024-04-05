<script lang="ts">
	import classNames from "classnames";
	import { goto } from "$app/navigation";
	import { getContext, onMount } from "svelte";

	const { isGameSet, playerNick, setPlayerNick } = getContext("gameSetupContext");

	let nickInput = $playerNick;
	let isNickInputSetFromContext = false;
	let showContinue = false;

	$: {
		if (!isNickInputSetFromContext && !nickInput && $playerNick) {
			nickInput = $playerNick;
			isNickInputSetFromContext = true;
		}
	}

	$: {
		showContinue = nickInput.length >= 3;
	}

	function onContinueClick() {
		if ($isGameSet) {
			setPlayerNick(nickInput, () => goto("game/play"));
		} else {
			setPlayerNick(nickInput, () => goto("game/create"));
		}
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.code === "Enter" && showContinue) {
			onContinueClick();
		}
	}
</script>

<div class="h-full grid place-content-center">
	<div class="sm:min-w-[300px]">
		<label class="label">
			<span>Nick</span>
			<input
				class="input"
				type="text"
				placeholder="Enter your nick"
				bind:value={nickInput}
				on:keydown={onKeyDown}
			/>
		</label>
		<button
			type="button"
			class={classNames("mt-2 w-full btn variant-filled", !showContinue && "invisible")}
			on:click={onContinueClick}>Continue</button
		>
	</div>
</div>
