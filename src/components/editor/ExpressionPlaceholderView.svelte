<svelte:options immutable={true} />

<script lang="ts">
    import type ExpressionPlaceholder from '@nodes/ExpressionPlaceholder';
    import NodeView from './NodeView.svelte';
    import {
        getCaret,
        getLocales,
        getProject,
        getRoot,
    } from '../project/Contexts';
    import RootView from '../project/RootView.svelte';
    import UnknownType from '../../nodes/UnknownType';
    import PlaceholderView from './PlaceholderView.svelte';

    export let node: ExpressionPlaceholder;

    const project = getProject();
    const root = getRoot();
    const caret = getCaret();
    const locale = getLocales();

    $: inferredType = $project
        ? node.getType($project.getNodeContext(node))
        : undefined;

    /** If this has no placeholder token, then get the label for field it represents */
    let placeholder: string | undefined;
    $: {
        if (node.placeholder === undefined && $root && $project) {
            const context = $project.getNodeContext($root.root);
            const parent = $root.getParent(node);
            if (parent)
                placeholder = parent.getChildPlaceholderLabel(
                    node,
                    locale[0],
                    context,
                    $root
                );
        } else placeholder = undefined;
    }
</script>

<span class="placeholder"
    ><span class={node.dot && node.type ? 'hidden' : ''}
        >{#if node.placeholder}<NodeView
                node={node.placeholder}
            />{:else if placeholder}<span class="label">{placeholder}</span
            >{/if}<NodeView node={node.dot} /></span
    ><span class="type"
        >{#if node.type}<NodeView
                node={node.type}
            />{:else if inferredType && !(inferredType instanceof UnknownType)}<span
                >•</span
            ><RootView
                inline
                elide
                inert
                localized
                node={inferredType}
            />{/if}{#if caret}<PlaceholderView position={node} />{/if}</span
    ></span
>

<style>
    .placeholder,
    .placeholder :global(.token-view) {
        color: var(--wordplay-inactive-color);
        font-style: italic;
        font-size: small;
    }

    .label {
        margin-inline-start: var(--wordplay-spacing);
        font-family: var(--wordplay-app-font);
    }

    /* Decided not to hide type. */
    /* .hidden :global(.token-view) {
        display: inline-block;
        width: 0;
        opacity: 0;
    } */
</style>
