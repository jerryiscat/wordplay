<h1><slot /></h1>

<style>
    h1 {
        font-size: min(10vw, 60pt);
        font-family: var(--wordplay-app-font);
        color: var(--wordplay-header);
        font-weight: bold;
        margin-inline-start: -0.5rem;
        margin-block-end: calc(var(--wordplay-spacing) / 3);
        text-align: start;
        transform: rotate(-1deg);
    }
</style>
