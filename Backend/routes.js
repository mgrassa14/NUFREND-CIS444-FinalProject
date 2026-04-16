const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');



router.post('/submit', async (req, res) => {
try{
  const db = req.app.locals.db;   // db attached in app.js
  const { name, message } = req.body;
  const entry = { name, message, timestamp: new Date() };
  await db.collection('submissions').insertOne(entry);
  res.json({ success: true, entry });
}catch(err){
    console.error('what you do?????:',err.message);
    res.status(500).json({error: 'failed to save submission'});
}
});


router.get('/',(req,res)=>{
  res.send('server is running!');
});


router.get('/dogprofile/:id', async (req, res) => { 
    const database = req.app.locals.db;
    const dogs = database.collection("Dogs"); 

    try {
        const query = { "_id": new ObjectId(req.params.id) };
        
        
        const dog = await dogs.findOne(query); 

        if (!dog) {
            return res.status(404).send("Dog not found");
        }

        console.log(dog);
        res.status(200).send(dog);
    } 
    catch (err) {
        console.error(err); 
        res.status(500).send("Failed to fetch dog"); 
    }
});

router.get('/dogs', async (req, res) => { 
    const database = req.app.locals.db;
    const dogs = database.collection("Dogs"); 

    try {
        const query = { _id:  1};
        const dog = await dogs.find().project(query).toArray(); 

        if (!dog) {
            return res.status(404).send("Dog not found");
        }

        console.log(dog);
        res.status(200).send(dog);
    } 
    catch (err) {
        console.error(err); 
        res.status(500).send("Failed to fetch dog"); 
    }
});

router.get('/user/:id', async (req, res) => { 
    const database = req.app.locals.db;
    const people = database.collection("People"); 

    try {
        const query = { "_id": new ObjectId(req.params.id) };
        
        const person = await people.findOne(query); 

        if (!person) {
            return res.status(404).send("user not found");

        }

        console.log(person);
        res.status(200).send(person);
    } 
    catch (err) {
        console.error(err); 
        res.status(500).send("Failed to fetch account"); 
    }
});


router.get('/user/favorites/:id', async (req, res) => { 
    const database = req.app.locals.db;
    const people = database.collection("People"); 

    try {
        const query = {"_id": new ObjectId(req.params.id)};
        
        const projectfield = { _id:0 , liked_dogs: 1 };//{ "_id": new ObjectId(req.params.id) };
        const personlikes = await people.find(query).project(projectfield).toArray();//await people.findOne(query).project(projectfield); 

        if (!personlikes) {
            return res.status(404).send("user not found/ favorites not found");
        }
        console.log(personlikes);
        res.status(200).send(personlikes);
    } 
    catch (err) {
        console.error(err); 
        res.status(500).send("Failed to fetch account liked"); 
    }
});



module.exports = router;