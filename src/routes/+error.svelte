<script lang="ts">
    import Header from '../components/app/Header.svelte';
    import { locale } from '../db/Database';
    import Link from '../components/app/Link.svelte';
    import Speech from '../components/lore/Speech.svelte';
    import Glyphs from '../lore/Glyphs';
    import Writing from '../components/app/Writing.svelte';
</script>

<Writing>
    <Header>{$locale.ui.page.unknown.header}</Header>
    <Speech glyph={Glyphs.Function}
        ><p slot="content">
            {$locale.ui.page.unknown.message}
            <Link to="/">🏠</Link></p
        ></Speech
    >
</Writing>
