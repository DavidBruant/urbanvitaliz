# Urban Vitaliz

## Dev

```sh
# Pour le dev (jekyll + rollup + api) 
npm run dev 
```

Y'a un [déploiement continue en place via github actions](.github/workflows/publish.yml) pour le front-end (Jekyll + Svelte)

L'API est hébergée chez Clever Cloud


### Base de données

L'API stocke les données dans une base de données MongoDB

[migrate-mongo](https://www.npmjs.com/package/migrate-mongo) est utilisé pour les migrations

#### Créer une migration

```sh
npm run database:migration:create -- <description>
```

#### Mise à jour de la base de donnée

```sh
npm run database:migrate:up
```

(un de ces 4, ça sera caché dans un process de déploiement continu)

#### Redescendre et status

```sh
npm run database:migrate:down
npm run database:migrate:status
```
