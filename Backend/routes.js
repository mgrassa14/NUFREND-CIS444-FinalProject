const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { register, login, verifyToken } = require('./firebase');
const { bucket } = require('./firebase'); // or wherever your config is
const axios = require('axios');

// ────────────────────────────────────
// router.post('/register', register);

// router.post('/login', login);


router.get('/', (req, res) => {
  res.send('server is running!');
});


router.get('/dogs', async (req, res) => { 
    const database = req.app.locals.db;
    const dogs = database.collection("Dogs"); 

    try {
        const query = {_id:1, name: 1,photos:1};
        const dog = await dogs.find().project(query).toArray(); 

        if (!dog) {
            return res.status(404).send("Dogs not found");
        }

        console.log(dog);
        res.status(200).send(dog);
    } 
    catch (err) {
        console.error(err); 
        res.status(500).send("Failed to fetch dog"); 
    }
});

router.get('/tstimg', async (req, res) => { 
    const database = req.app.locals.db;
    const dogs = database.collection("Dogs"); 

   
        const dogid = "85c3a4e5f6d2c3456789001a";


    
});

router.get('/tstimg', async (req, res) => { 
    const database = req.app.locals.db;
    const dogs = database.collection("Dogs"); 

    try {
        const query = {_id:1, name: 1,photos:1};
        const dog = await dogs.find().project(query).toArray(); 

        if (!dog) {
            return res.status(404).send("Dogs not found");
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

// router.get('/Vdogprofile/:id', verifyToken, async (req, res) => {
//   const dogs = req.app.locals.db.collection("Dogs");
//   try {
//     const dog = await dogs.findOne({ "_id": new ObjectId(req.params.id) });
//     if (!dog) return res.status(404).send("Dog not found");
//     res.status(200).send(dog);
//   } catch (err) {
//     res.status(500).send("Failed to fetch dog");
//   }
// });

// router.get('/Vdogprofile/:id',verifyToken, async (req, res) => {
//   const dogs = req.app.locals.db.collection("Dogs");
//   try {
   
//  const dog = await dogs.findOne({ "_id": new ObjectId(req.params.id) });
//    if (!dog) return res.status(404).send("Dog not found");
//     res.status(200).send(dog);
//      res.setHeader('Content-Type', 'image/jpeg');

//     res.setHeader('Transfer-Encoding', 'chunked');
  
//     const file = bucket.file(`test image.jpg`);

//     const stream = file.createReadStream();

//     stream.on('error', () => res.status(404).send("Image not found"));
//     res.setHeader('Content-Type', 'image/jpeg');
//     stream.pipe(res);

//   } catch (err) {
//     res.status(500).send("Failed to fetch dog");
//   }
// });

// router.get('/Vdogprofile/:id', verifyToken, async (req, res) => {
//   const dogs = req.app.locals.db.collection("Dogs");
//   try {
//     const dog = await dogs.findOne({ "_id": new ObjectId(req.params.id) });
//     if (!dog) return res.status(404).send("Dog not found");

//     // read image into buffer then convert to base64
//     const file = bucket.file(`test image.jpg`);
//     const [exists] = await file.exists();
    
//     let imageBase64 = null;
//     if (exists) {
//       const [buffer] = await file.download();
//       imageBase64 = buffer.toString('base64');
//     }

//     // send dog data + image together as JSON
//     res.status(200).json({
//       ...dog,
//       image: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : null
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Failed to fetch dog");
//   }
// });


router.get('/Vdogprofile/:id', verifyToken, async (req, res) => {
  const dogs = req.app.locals.db.collection("Dogs");
  try {
    const dog = await dogs.findOne({ "_id": new ObjectId(req.params.id) });
    if (!dog) return res.status(404).send("Dog not found");
    res.status(200).json(dog);
  } catch (err) {
    res.status(500).send("Failed to fetch dog");
  }
});


router.get('/Vdogprofile/:id/image/:filename', verifyToken, async (req, res) => {
  try {
    const file = bucket.file(`dogs/${req.params.id}/${req.params.filename}`);
    const [exists] = await file.exists();
    if (!exists) return res.status(404).send("Image not found");

    res.setHeader('Content-Type', 'image/jpeg');
    const stream = file.createReadStream();
    stream.on('error', () => res.status(404).send("Image not found"));
    stream.pipe(res);
  } catch (err) {
    res.status(500).send("Failed to fetch image");
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