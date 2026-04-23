//connect to the db
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



const client = new MongoClient(process.env.DATABASE_URL, {
  serverApi: { version: ServerApiVersion.v1, strict: true,deprecationErrors: true,}
});


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: process.env.API_KEY,
//   authDomain: process.env.AUTH_DOMAIN,
//   projectId: process.env.PROJECT_ID,
//   storageBucket: process.env.STORAGE_BUCKET,
//   messagingSenderId: process.env.MESSENGING_USER_ID,
//   appId:             process.env.APP_ID,          
//   measurementId:     process.env.MEASUREMENT_ID
// };
//

const firebaseConfig = {
   apiKey:"AIzaSyA4lNVzdOmy8lyd1qAKmoMB7Kx8h8JZ2c0",
  authDomain:  "nufrend-4c569.firebaseapp.com",
  projectId: "nufrend-4c569",
  storageBucket: "nufrend-4c569.firebasestorage.app",
  messagingSenderId: "469494271060",
  appId:         "1:469494271060:web:35373321e927b93ced71c1",
  measurementId:  "G-MN00YRH47F"
};



// Initialize Firebase



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
module.exports = { connectDB, client, runPing,firebaseConfig };