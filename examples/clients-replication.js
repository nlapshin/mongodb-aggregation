const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:40001,localhost:40002,localhost:40003/?replicaSet=rs0';
const client = new MongoClient(url);

async function start() {
  await client.connect();
  console.log('Connected successfully to server');
  
  return {
    client
  }
}

module.exports = {
  start
};
