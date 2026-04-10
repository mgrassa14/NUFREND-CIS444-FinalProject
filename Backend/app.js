const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const { connectDB,runPing,client } = require('./config');

const Router = require('./routes');
const express = require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(express.static('public')) // serves static files
app.use('/api', Router);

connectDB().then(db => {
  app.locals.db = db;  // attach db to app so routes can access it
});

app.use('/api', Router);

//const dogRoutes = require('./routes/dogRoutes')(client);



//seeDogs("64a1f2c3e4b0a1234567890a").catch(console.dir);
//runPing().catch(console.dir);
module.exports = app;