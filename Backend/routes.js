const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { verifyToken } = require('./firebase');
const { bucket } = require('./firebase');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// ────────────────────────────────────
//  Auth
// ────────────────────────────────────

// Signup — creates Firebase account + People doc in MongoDB
router.post('/register', async (req, res) => {
  const { name, email, password, accountType } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // 1. Create Firebase auth account
    const fbRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      }
    );
    const fbData = await fbRes.json();
    if (!fbRes.ok) {
      const msg = fbData?.error?.message || 'Firebase signup failed';
      return res.status(400).json({ message: msg });
    }

    // 2. Create document in the correct MongoDB collection
    const collectionName = accountType === 'shelter' ? 'business' : 'People';
    const collection = req.app.locals.db.collection(collectionName);
    const newUser = {
      name:        name || '',
      email,
      firebaseUid: fbData.localId,
      accountType: accountType || 'adopter',
      created_at:  new Date(),
      updated_at:  new Date()
    };

    // Adopters get a liked_dogs array, shelters get a dogs array
    if (accountType === 'shelter') {
      newUser.dogs = [];
    } else {
      newUser.liked_dogs = [];
    }

    const result = await collection.insertOne(newUser);

    // 3. Return token + real Mongo _id
    res.status(201).json({
      message:      'User created successfully',
      userId:       result.insertedId.toString(),
      userType:     accountType,
      idToken:      fbData.idToken,
      refreshToken: fbData.refreshToken
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup failed' });
  }
});

// Login — authenticates with Firebase + looks up Mongo _id
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // 1. Authenticate with Firebase
    const fbRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      }
    );
    const fbData = await fbRes.json();
    if (!fbRes.ok) {
      const msg = fbData?.error?.message || 'Login failed';
      return res.status(400).json({ message: msg });
    }

    // 2. Look up user by Firebase UID — check both collections
    const db = req.app.locals.db;
    let user = await db.collection('People').findOne({ firebaseUid: fbData.localId });
    if (!user) {
      user = await db.collection('business').findOne({ firebaseUid: fbData.localId });
    }

    if (!user) {
      return res.status(404).json({ message: 'No account found — please sign up first' });
    }

    // 3. Return token + real Mongo _id + account type
    res.status(200).json({
      message:      'Login successful',
      userId:       user._id.toString(),
      userType:     user.accountType,
      idToken:      fbData.idToken,
      refreshToken: fbData.refreshToken
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// ────────────────────────────────────
//  Health check
// ────────────────────────────────────
router.get('/', (req, res) => {
  res.send('server is running!');
});

// ────────────────────────────────────
//  Dogs – list
// ────────────────────────────────────
router.get('/dogs', async (req, res) => {
  const dogs = req.app.locals.db.collection('Dogs');
  try {
    const results = await dogs
      .find()
      .project({ _id: 1, name: 1, photos: 1 })
      .toArray();

    if (!results.length) return res.status(404).send('No dogs found');

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch dogs');
  }
});

// ────────────────────────────────────
//  Dog profile – GET (public, with optional ownership flag)
// ────────────────────────────────────
router.get('/dogprofile/:id', async (req, res) => {
  const dogs = req.app.locals.db.collection('Dogs');
  try {
    const dog = await dogs.findOne({ _id: new ObjectId(req.params.id) });
    if (!dog) return res.status(404).send('Dog not found');

    // Ownership check — try to read the auth token if one was sent.
    // If it's valid and the user's ID matches the dog's shelterId we
    // set isOwner = true so the frontend knows to show the Edit button.
    let isOwner = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const { getAuth } = require('firebase-admin/auth');
        const token = authHeader.split(' ')[1];
        const decoded = await getAuth().verifyIdToken(token);

        // The shelter (business doc) has a `dogs` array of ObjectIds.
        // If the logged-in user's dogs array contains this dog, they own it.
        const people = req.app.locals.db.collection('People');
        const business = req.app.locals.db.collection('business');
        let user = await people.findOne({ firebaseUid: decoded.uid });
        if (!user) {
          user = await business.findOne({ firebaseUid: decoded.uid });
        }
        if (user && user.dogs && user.dogs.some(id => id.equals(dog._id))) {
          isOwner = true;
        }
      } catch (_) {
        // Token invalid or expired — just serve public view
      }
    }

    res.status(200).json({ ...dog, isOwner });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch dog');
  }
});

// ────────────────────────────────────
//  Dog profile – UPDATE (auth required)
// ────────────────────────────────────
router.put('/dogprofile/:id', verifyToken, async (req, res) => {
  const dogs = req.app.locals.db.collection('Dogs');
  try {
    const allowedFields = [
      'name', 'breed', 'age', 'weight', 'energy',
      'gender', 'color', 'description',
      'vaccinated', 'neutered', 'tags'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    updates.updated_at = new Date();

    await dogs.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updates }
    );

    const updated = await dogs.findOne({ _id: new ObjectId(req.params.id) });
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update dog profile');
  }
});

// ────────────────────────────────────
//  Dog profile – PHOTO upload (auth required)
// ────────────────────────────────────
router.put('/dogprofile/:id/photo', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No photo provided');

    const dogId = req.params.id;
    const filename = `${Date.now()}_${req.file.originalname}`;
    const filePath = `dogs/${dogId}/${filename}`;
    const file = bucket.file(filePath);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });

    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    // Push the new URL to the photos array
    const dogs = req.app.locals.db.collection('Dogs');
    await dogs.updateOne(
      { _id: new ObjectId(dogId) },
      { $set: { 'photos.0': publicUrl, updated_at: new Date() } }
    );

    res.status(200).json({ url: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to upload photo');
  }
});

// ────────────────────────────────────
//  Dog profile image – GET (auth required)
// ────────────────────────────────────
router.get('/Vdogprofile/:id/image/:filename', verifyToken, async (req, res) => {
  try {
    const file = bucket.file(`dogs/${req.params.id}/${req.params.filename}`);
    const [exists] = await file.exists();
    if (!exists) return res.status(404).send('Image not found');

    res.setHeader('Content-Type', 'image/jpeg');
    const stream = file.createReadStream();
    stream.on('error', () => res.status(404).send('Image not found'));
    stream.pipe(res);
  } catch (err) {
    res.status(500).send('Failed to fetch image');
  }
});

// ────────────────────────────────────
//  Users
// ────────────────────────────────────
router.get('/user/:id', async (req, res) => {
  const people = req.app.locals.db.collection('People');
  try {
    const person = await people.findOne({ _id: new ObjectId(req.params.id) });
    if (!person) return res.status(404).send('User not found');

    res.status(200).json(person);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch account');
  }
});

router.get('/Vuser/:id', verifyToken, async (req, res) => {
  const people = req.app.locals.db.collection('People');
  try {
    const person = await people.findOne({ _id: new ObjectId(req.params.id) });
    if (!person) return res.status(404).send('User not found');

    res.status(200).json(person);
  } catch (err) {
    res.status(500).send('Failed to fetch account');
  }
});

// ────────────────────────────────────
//  Favorites
// ────────────────────────────────────
router.get('/user/favorites/:id', async (req, res) => {
  const people = req.app.locals.db.collection('People');
  try {
    const person = await people.findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { _id: 0, liked_dogs: 1 } }
    );
    if (!person) return res.status(404).send('User not found');

    res.status(200).json(person.liked_dogs || []);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch favorites');
  }
});

router.put('/user/addfavorites/:id', async (req, res) => {
  const people = req.app.locals.db.collection('People');
  try {
    const query = { _id: new ObjectId(req.params.id) };

    await people.updateOne(query, {
      $push: { liked_dogs: req.body.dogId },
      $set: { updated_at: new Date() }
    });

    const person = await people.findOne(query, {
      projection: { _id: 0, liked_dogs: 1 }
    });
    if (!person) return res.status(404).send('User not found');

    res.status(200).json(person.liked_dogs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update favorites');
  }
});

module.exports = router;