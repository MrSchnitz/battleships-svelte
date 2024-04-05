<script lang="ts">
    import Icon from "@iconify/svelte";
    import { fade } from 'svelte/transition';
</script>

<div class="relative z-[100] text-white" transition:fade={{ delay: 100, duration: 100 }}>
    <Icon icon="fe:disabled" width="95%" height="95%" />
</div>