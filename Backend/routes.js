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

router.post('/register', async (req, res) => {
  const { name, email, password, accountType } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
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

    if (accountType === 'shelter') {
      newUser.dogs = [];
    } else {
      newUser.liked_dogs = [];
    }

    const result = await collection.insertOne(newUser);

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

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
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

    const db = req.app.locals.db;
    let user = await db.collection('People').findOne({ firebaseUid: fbData.localId });
    if (!user) {
      user = await db.collection('business').findOne({ firebaseUid: fbData.localId });
    }

    if (!user) {
      return res.status(404).json({ message: 'No account found — please sign up first' });
    }

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
//  Dog profile – GET
// ────────────────────────────────────
router.get('/dogprofile/:id', async (req, res) => {
  const dogs = req.app.locals.db.collection('Dogs');
  try {
    const dog = await dogs.findOne({ _id: new ObjectId(req.params.id) });
    if (!dog) return res.status(404).send('Dog not found');

    let isOwner = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const { getAuth } = require('firebase-admin/auth');
        const token = authHeader.split(' ')[1];
        const decoded = await getAuth().verifyIdToken(token);

        const people = req.app.locals.db.collection('People');
        const business = req.app.locals.db.collection('business');
        let user = await people.findOne({ firebaseUid: decoded.uid });
        if (!user) {
          user = await business.findOne({ firebaseUid: decoded.uid });
        }
        if (user && user.dogs && user.dogs.some(id => id.equals(dog._id))) {
          isOwner = true;
        }
      } catch (_) {}
    }

    res.status(200).json({ ...dog, isOwner });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch dog');
  }
});

// ────────────────────────────────────
//  Dog profile – UPDATE
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
//  Dog profile – PHOTO upload
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
//  Dog profile image – GET
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
//  Users – GET
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
//  Users – UPDATE profile (auth required)
// ────────────────────────────────────
router.put('/user/:id', verifyToken, async (req, res) => {
  const people = req.app.locals.db.collection('People');
  try {
    const allowedFields = [
      'name', 'phone', 'email', 'bio',
      'city', 'state', 'zip',
      'preferences'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    updates.updated_at = new Date();

    await people.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updates }
    );

    const updated = await people.findOne({ _id: new ObjectId(req.params.id) });
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update user profile');
  }
});

// ────────────────────────────────────
//  Users – PHOTO upload (auth required)
// ────────────────────────────────────
router.put('/user/:id/photo', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No photo provided');

    const userId = req.params.id;
    const filename = `${Date.now()}_${req.file.originalname}`;
    const filePath = `users/${userId}/${filename}`;
    const file = bucket.file(filePath);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });

    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    const people = req.app.locals.db.collection('People');
    await people.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { photo: publicUrl, updated_at: new Date() } }
    );

    res.status(200).json({ url: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to upload photo');
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

// ────────────────────────────────────
//  Business / Shelter – UPDATE
// ────────────────────────────────────
router.put('/business/:id', verifyToken, async (req, res) => {
  const db = req.app.locals.db;
  const business = db.collection('business');
  const dogs = db.collection('Dogs');

  try {
    const { address, phone, email } = req.body;

    const updates = { updated_at: new Date() };
    if (address) updates.address = address;
    if (phone)   updates.phone   = phone;
    if (email)   updates.email   = email;

    await business.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updates }
    );

    const updated = await business.findOne({ _id: new ObjectId(req.params.id) });

    if (updated && updated.dogs && updated.dogs.length > 0) {
      const shelterInfo = {
        name:    updated.name || '',
        address: updated.address || '',
        phone:   updated.phone || '',
        email:   updated.email || ''
      };

      await dogs.updateMany(
        { _id: { $in: updated.dogs } },
        { $set: { shelter: shelterInfo, updated_at: new Date() } }
      );
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update shelter profile');
  }
});

// ────────────────────────────────────
//  Business – add dog + populate shelter info
// ────────────────────────────────────
router.put('/business/:id/adddog/:dogId', verifyToken, async (req, res) => {
  const db = req.app.locals.db;
  const business = db.collection('business');
  const dogs = db.collection('Dogs');

  try {
    const shelterId = new ObjectId(req.params.id);
    const dogId = new ObjectId(req.params.dogId);

    const dog = await dogs.findOne({ _id: dogId });
    if (!dog) return res.status(404).send('Dog not found');

    await business.updateOne(
      { _id: shelterId },
      { $addToSet: { dogs: dogId }, $set: { updated_at: new Date() } }
    );

    const shelter = await business.findOne({ _id: shelterId });
    const shelterInfo = {
      name:    shelter.name || '',
      address: shelter.address || '',
      phone:   shelter.phone || '',
      email:   shelter.email || ''
    };

    await dogs.updateOne(
      { _id: dogId },
      { $set: { shelter: shelterInfo, updated_at: new Date() } }
    );

    res.status(200).json({ message: 'Dog linked and shelter info applied', dogId, shelterInfo });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add dog to shelter');
  }
});

module.exports = router;