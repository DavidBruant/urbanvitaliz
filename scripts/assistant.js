import { Octokit } from '@octokit/rest';
import frontmatter from 'front-matter';

import Assistant from './Assistant.svelte';

const Buffer = buffer.Buffer;

const state = {
    étapes: ["1 - le début", "2 - le milieu", "12 - genre après", "37 - vers la fin"],
    thématiques: ['chou', 'patate'],
    filters: {
        étapes: new Set(),
        thématiques: new Set()
    },
    allResources: [],
    relevantResources: []
}

state.filters.étapes = new Set(state.étapes);
state.filters.thématiques = new Set(state.thématiques);

function findRelevantResources(allResources, filters){
    return allResources.filter(r => {
        return filters.étapes.has(r.attributes.etape) && filters.thématiques.has(r.attributes.thematique)
    })
}

function étapeFilterChange(étape){
    if(state.filters.étapes.has(étape))
        state.filters.étapes.delete(étape)
    else
        state.filters.étapes.add(étape)

    state.relevantResources = findRelevantResources(allResources, state.filters)

    render()
}

function thématiqueFilterChange(thématique){
    if(state.filters.thématiques.has(thématique))
        state.filters.thématiques.delete(thématique)
    else
        state.filters.thématiques.add(thématique)

    state.relevantResources = findRelevantResources(allResources, state.filters)

    render()
}

function render(){
    assistantUI.$set({
        ...state, 
        étapeFilterChange, 
        thématiqueFilterChange
    })
}


const assistantUI = new Assistant({
    target: document.querySelector('.svelte-main'),
    props: {
        ...state, 
        étapeFilterChange, 
        thématiqueFilterChange
    }
});


const octokit = new Octokit()

const owner = 'DavidBruant';
const repo = 'urbanvitaliz'
const path = '_tmp_resources'

octokit.repos.getContent({
    owner,
    repo,
    path,
}).then(({data}) => {
    const relevantFiles = data.filter(
        ({name, type}) => type === "file" && name.endsWith('.md')
    );

    return Promise.allSettled(
        relevantFiles.map( f => fetch(f.url).then(r => r.json()) )
    )
    .then(rs => rs
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .map(({name: filename, content}) => {
            const {body, attributes} = frontmatter( Buffer.from(content, 'base64').toString('utf-8') )
            
            return { filename, content: body, attributes }
        })
    )
})
.then(resources => {
    state.allResources = resources;
    state.relevantResources = findRelevantResources(resources, state.filters)

    render()
})