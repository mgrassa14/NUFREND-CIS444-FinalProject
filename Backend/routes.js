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

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = req.app.locals.db;
    const people = db.collection('People');

    // Find user by email
    const user = await people.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with that email' });
    }

    // Check password (plain text for now — we can add hashing later)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    res.status(200).json({ message: 'Login successful', user });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// POST /api/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, accountType } = req.body;

  try {
    const db = req.app.locals.db;
    const people = db.collection('People');

    // Check if email already exists
    const existing = await people.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Insert new user into People collection
    const newUser = {
      name,
      email,
      password,   // plain text for now — we can add hashing later
      accountType,
      createdAt: new Date()
    };

    const result = await people.insertOne(newUser);

    res.status(201).json({ message: 'Signup successful', userId: result.insertedId });

  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

module.exports = router;