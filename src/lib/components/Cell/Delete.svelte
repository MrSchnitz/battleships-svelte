<script lang="ts">
    import Icon from "@iconify/svelte";
    import { fade } from 'svelte/transition';
</script>

<div class="relative flex justify-center items-center z-[100] text-white" in:fade={{ delay: 300, duration: 100 }}>
    <Icon icon="fe:trash" width="70%" height="70%" />
</div>