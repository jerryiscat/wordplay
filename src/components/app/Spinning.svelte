<script lang="ts">
    export let label: string;
    export let large = false;
</script>

<div
    class="cursor"
    class:large
    aria-live="assertive"
    aria-atomic="true"
    aria-relevant="all"
    aria-label={label}
/>

<style>
    .cursor {
        display: inline-block;
        animation: spin infinite linear;
        animation-duration: calc(var(--animation-factor) * 1s);
        transform-origin: center;
        border: var(--wordplay-inactive-color) solid var(--wordplay-focus-width);
        border-radius: var(--wordplay-border-radius);
        background: var(--wordplay-alternating-color);
        width: 1em;
        height: 1em;
    }

    .large {
        font-size: 200%;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        50% {
            transform: rotate(180deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
