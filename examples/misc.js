const { ObjectId } = require("mongodb");
const { start } = require('./clients');

upsert()

async function upsert() {
  const { movies } = await start();

  const collection = movies.collection('my-test');

  const query = { name: 'John' };

  const updateDocument = {
      $set: {
        name: 'New name John'
      },
      $setOnInsert: {
        age: 100500
      },
  };

  const options = { upsert: true };

  await collection.updateOne(query, updateDocument, options);

  console.log('End');
}
