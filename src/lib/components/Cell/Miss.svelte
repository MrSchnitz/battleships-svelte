<script lang="ts">
</script>

<div class="miss" />

<style>
	.miss {
		width: 0.7vmax;
		height: 3.8vmax;
		border-radius: 5px;
		background: #2d2d2d;
		transform-origin: center center;
		transform: rotate(45deg);
		animation: blow 0.5s ease-in;
	}

	@keyframes blow {
		0% {
			transform: scale(0);
		}
		1% {
			transform: rotate(45deg);
		}
		80% {
			transform: scale(1.7);
		}
		100% {
			transform: scale(1);
		}
	}

	.miss::after {
		content: "";
		width: 100%;
		height: 100%;
		position: absolute;
		border-radius: 5px;
		background: #2d2d2d;
		transform: rotate(90deg);
	}

    @media only screen and (min-width: 768px) {
        .miss {
            width: 0.5vmax;
            height: 2.4vmax;
        }
    }
</style>
