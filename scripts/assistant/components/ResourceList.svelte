<script>
    export let relevantResources;
</script>

<section>
    <h2>Liste des ressources pertinentes ({relevantResources.length})</h2>

    {#if relevantResources.length === 0}
        <p>(Pas de ressource pertinente pour le moment)</p>
    {:else}
        <ul>
            {#each relevantResources as resource}
            <li>
                {resource.attributes.phrase_catch}
            </li>
            {/each}
        </ul>
    {/if}
</section>

<style>
    
</style>
