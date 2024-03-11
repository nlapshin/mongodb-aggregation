const { start } = require('./clients-replication');

db.collection.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-73.8601152, 40.7311739]
      },
      $maxDistance: 1000
    }
  }
});

async function run() {
  const { client } = await start();
  // Сессию
  const session = client.startSession();

  try {
    // стартуем транзацию
    session.startTransaction();

    const db = client.db('mydb');
    const collection = db.collection('mycollection');

    const insertDocument = { name: 'Alice', age: 25 };
    const updateQuery = { name: 'Alice' };
    const updateData = { $set: { age: 26 } };

    await collection.insertOne(insertDocument, { session });
    await collection.updateOne(updateQuery, updateData, { session });

    // await delay();

    await session.commitTransaction();

    console.log('Transaction committed successfully.');

  } catch (err) {
    console.error('Error:', err);
    session.abortTransaction();
  } finally {
    session.endSession();
    await client.close();
    console.log('Connection closed.');
  }
}

run();


async function delay() {
  return new Promise((res, rej) => {
    setTimeout(res, 10000); // 10 секунд
  })
}
