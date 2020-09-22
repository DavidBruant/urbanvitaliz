import database from './database/index.js'

const CAPABILITY_PARAM_NAME = `secret`

const UPLOAD_ROUTE = `/upload`

const USER_VISIBLE_BASE_URL = `https://davidbruant.github.io/urbanvitaliz`
const USER_VISIBLE_UPLOAD_URL = `${USER_VISIBLE_BASE_URL}${UPLOAD_ROUTE}`

{ // init sequence
    database.getOrCreateUploadCapability().then(secret => {
        console.log(`URL d'upload:`, `${USER_VISIBLE_UPLOAD_URL}?${CAPABILITY_PARAM_NAME}=${secret}`)
    })
}

app.post(UPLOAD_ROUTE, (req, res) => {
    const {[CAPABILITY_PARAM_NAME]: secret} = req.query

    database.checkUploadSecret(secret)
    .then(() => {
        res.status(404).send('TODO')
        throw `TODO pick up csv
        add entries to the database`
    })
    .catch(err => res.status(403).send('unknown upload secret'))
})


