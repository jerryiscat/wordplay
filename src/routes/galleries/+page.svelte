<script lang="ts">
    import Header from '@components/app/Header.svelte';
    import Writing from '@components/app/Writing.svelte';
    import { locale } from '@db/Database';
    import MarkupHtmlView from '../../components/concepts/MarkupHTMLView.svelte';
    import { onMount } from 'svelte';
    import {
        collection,
        getDocs,
        limit,
        orderBy,
        query,
        where,
        type DocumentData,
        QueryDocumentSnapshot,
        startAfter,
    } from 'firebase/firestore';
    import { firestore } from '../../db/firebase';
    import type { SerializedGallery } from '../../models/Gallery';
    import Gallery from '../../models/Gallery';
    import GalleryPreview from '../../components/app/GalleryPreview.svelte';
    import Spinning from '../../components/app/Spinning.svelte';
    import Button from '../../components/widgets/Button.svelte';
    import { ExampleGalleries } from '../../examples/examples';

    let lastBatch: QueryDocumentSnapshot<DocumentData>;

    /** Start the list of galleries with the example galleries. */
    let galleries: Gallery[] = ExampleGalleries.slice();

    onMount(async () => {
        nextBatch();
    });

    async function nextBatch() {
        if (firestore === undefined) return firestore;
        const first = lastBatch
            ? query(
                  collection(firestore, 'galleries'),
                  where('public', '==', true),
                  orderBy('featured'),
                  orderBy('id'),
                  startAfter(lastBatch),
                  limit(5)
              )
            : query(
                  collection(firestore, 'galleries'),
                  where('public', '==', true),
                  orderBy('featured'),
                  orderBy('id'),
                  limit(5)
              );
        const documentSnapshots = await getDocs(first);

        // Remember the last document.
        lastBatch = documentSnapshots.docs[documentSnapshots.docs.length - 1];

        // Convert the docs to galleries
        galleries = [
            ...(galleries ?? []),
            ...documentSnapshots.docs.map(
                (snap) => new Gallery(snap.data() as SerializedGallery)
            ),
        ];
    }
</script>

<svelte:head>
    <title>{$locale.ui.page.galleries.header}</title>
</svelte:head>

<Writing>
    <Header>{$locale.ui.page.galleries.header}</Header>
    <MarkupHtmlView markup={$locale.ui.page.galleries.prompt} />

    {#if galleries === undefined}
        <Spinning label="" />
    {:else}
        <div class="previews">
            {#each galleries as gallery}
                <div class="preview">
                    <GalleryPreview {gallery} />
                </div>
            {/each}
        </div>
    {/if}

    {#if lastBatch}
        <Button background tip="more" action={nextBatch}>more!</Button>
    {/if}
</Writing>

<style>
    .previews {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 2em;
    }

    .preview {
        min-width: 40%;
    }
</style>
