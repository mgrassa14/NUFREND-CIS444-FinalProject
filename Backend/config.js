//connect to the db
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');

const client = new MongoClient(process.env.DATABASE_URL, {
  serverApi: { version: ServerApiVersion.v1, strict: true,deprecationErrors: true,}
});

async function connectDB() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
     return client.db('MyNufrends');
  } catch(err){
    console.error('failed to connect to Mongodb: ',err.message);
    process.exit(1);
  }
}

async function runPing() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

// exports 
module.exports = { connectDB, client, runPing};