const { ObjectId } = require("mongodb");
const { start } = require('./clients');

cursorRead();

async function cursorRead() {
  const { movies } = await start();

  let count = 0;
  const cursor = movies.collection('movies').find()

  while (await cursor.hasNext()) {
    await cursor.next();
    console.log(++count);
  }
}

// const cursor = myColl.find({});
  // console.log("async");
  // for await (const doc of cursor) {
  //   console.log(doc);
  // }
