import mongodbpackage from "mongodb"
import constants from "./constants.cjs"
import makeCapString from "../server/random-cap.js"

const { MongoClient, ObjectID } = mongodbpackage
const {DATABASE_NAME, MONGO_URL, COLLECTIONS: {PERSONS, FRICHES_COLLECTIONS, FRICHES}} = constants

const client = new MongoClient(MONGO_URL, { useUnifiedTopology: true });

await client.connect();

const database = client.db(DATABASE_NAME);


export async function getOrCreateFricheCollectionByEmail(email){
    const [persons, friches_collections] = await Promise.all([PERSONS, FRICHES_COLLECTIONS].map(name => database.collection(name)))
    let person = await persons.findOne({emails: email})

    console.log('found person', person)

    let newUser = false;

    if(!person){
        const {ops} = await persons.insertOne({emails: [email]})
        person = ops[0]
        console.log('inserted person', person)
        newUser = true;
    }

    let thisPersonsFricheCollection = await friches_collections.findOne({created_by: ObjectID(person._id)})

    if(!thisPersonsFricheCollection){
        const {ops} = await friches_collections.insertOne({created_by: ObjectID(person._id), friche_ids: [], edit_cap: makeCapString()})
        thisPersonsFricheCollection = ops[0]
        console.log('inserted thisPersonsFricheCollection', thisPersonsFricheCollection)
    }

    return {
        fricheCollection: thisPersonsFricheCollection,
        newUser
    }
}


export async function getFricheCollection(fricheCollectionId){
    const [friches_collections, frichesMongoCollection] = await Promise.all([FRICHES_COLLECTIONS, FRICHES].map(name => database.collection(name)))
    const {friche_ids, edit_cap} = await friches_collections.findOne({_id: ObjectID(fricheCollectionId)})
    const friches = await frichesMongoCollection.find({_id: {$in: friche_ids}}).toArray()
    
    return {
        friches,
        edit_cap
    }
}

export async function addFricheToCollection({collection_edit_cap, friche}){
    const [friches_collections, frichesMongoCollection] = await Promise.all([FRICHES_COLLECTIONS, FRICHES].map(name => database.collection(name)))

    const fricheCollectionToEdit = await friches_collections.findOne({edit_cap: collection_edit_cap})

    if(!fricheCollectionToEdit){
        throw new Error(`No friche collection for edit_cap '${collection_edit_cap}'`)
    }


    const {ops} = await frichesMongoCollection.insertOne(friche)
    const insertedFriche = ops[0]
    console.log('insertedFriche', insertedFriche)

    await friches_collections.updateOne({edit_cap: collection_edit_cap}, {$push: {friche_ids: insertedFriche._id}})

    return insertedFriche
}