const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { register, login, verifyToken } = require('./firebase');

// ────────────────────────────────────
router.post('/register', register);

router.post('/login', login);


router.get('/', (req, res) => {
  res.send('server is running!');
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


router.get('/Vuser/:id', verifyToken, async (req, res) => {
  const people = req.app.locals.db.collection("People");
  try {
    const person = await people.findOne({ "_id": new ObjectId(req.params.id) });
    if (!person) return res.status(404).send("User not found");
    res.status(200).send(person);
  } catch (err) {
    res.status(500).send("Failed to fetch account");
  }
});

router.get('/Vdogprofile/:id', verifyToken, async (req, res) => {
  const dogs = req.app.locals.db.collection("Dogs");
  try {
    const dog = await dogs.findOne({ "_id": new ObjectId(req.params.id) });
    if (!dog) return res.status(404).send("Dog not found");
    res.status(200).send(dog);
  } catch (err) {
    res.status(500).send("Failed to fetch dog");
  }
});

module.exports = router;