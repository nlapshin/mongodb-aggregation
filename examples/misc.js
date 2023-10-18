const { ObjectId } = require("mongodb");
const { start } = require('./clients');

upsert()
// groupFunction()
// groupAccumulate()

async function upsert() {
  const { movies } = await start();

  const collection = movies.collection('my-test');

  const query = { name: 'John' };

  const updateDocument = {
      $set: {
        name: 'John'
      },
      $setOnInsert: {
        age: 45
      },
  };

  const options = { upsert: true };

  await collection.updateOne(query, updateDocument, options);

  console.log('End');
}
