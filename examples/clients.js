const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27018';
const client = new MongoClient(url);

async function start() {
  await client.connect();
  console.log('Connected successfully to server');
  
  return {
    client,
    movies: client.db('sample_mflix')
  }
}

module.exports = {
  start
};
