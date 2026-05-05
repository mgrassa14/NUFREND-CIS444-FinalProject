const admin = require('firebase-admin');
const {initializeApp} = require('firebase/app');
const {getStorage,ref,uploadBytes,getDownloadURL} = require('firebase/storage');
const serviceAccount = require('../Backend/nufrend-4c569-ceb56659e474.json');



// Initialize Cloud Storage and get a reference to the service
// let serviceAccount;
// try {
//   serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// } catch (err) {
//   console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT from .env:', err.message);
//   process.exit(1);  // stop server if service account is broken
// }

admin.initializeApp({
  
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.PROJECT_ID,
 storageBucket: process.env.CUBETA,
});

const auth = admin.auth();
const db = admin.firestore();
const bucket = admin.storage().bucket();

console.log(bucket.name);

const AUTH_API = 'https://identitytoolkit.googleapis.com/v1/accounts';
const API_KEY = process.env.API_KEY;
console.log('API KEY::', process.env.API_KEY);
const firebaseAuthErrors = {
  'EMAIL_EXISTS':           'Email is already registered',
  'INVALID_EMAIL':          'Invalid email address',
  'WEAK_PASSWORD':          'Password must be at least 6 characters',
  'USER_NOT_FOUND':         'No account found with this email',
  'INVALID_PASSWORD':       'Incorrect password',
  'TOO_MANY_ATTEMPTS':      'Too many attempts, please try again later',
};

function handleFirebaseError(error) {
  const errorCode = error?.error?.message || error.message || 'UNKNOWN';
  const message = firebaseAuthErrors[errorCode] || errorCode || 'An unexpected error occurred';
  return { code: errorCode, message };
}

// ── Helper to make Firebase REST calls ────────────
async function firebasePost(endpoint, body) {
  const response = await fetch(`${AUTH_API}${endpoint}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) throw data;   // ✅ throw error data if request failed

  return data;
}

// ── Register ───────────────────────────────────────
async function register(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ code: 'invalid-input', message: 'Email and password are required' });
  }

  try {
    const data = await firebasePost(':signUp', {
      email,
      password,
      returnSecureToken: true
    });


    return res.status(201).json({ 
  message: 'User created successfully', 
  userId: data.localId,        // Firebase UID
  idToken: data.idToken,       // fix the typo
  refreshToken: data.refreshToken
});
  } catch (error) {
    const { code, message } = handleFirebaseError(error);
    return res.status(400).json({ code, message });
  }
}

// ── Login ──────────────────────────────────────────
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ code: 'invalid-input', message: 'Email and password are required' });
  }

  try {
    const data = await firebasePost(':signInWithPassword', {
      email,
      password,
      returnSecureToken: true
    });

    return res.status(200).json({ 
      message: 'Login successful',
      userId: data.localId,
      userType: data.userType,
      idToken: data.idToken,
      refreshToken: data.refreshToken
    });
  } catch (error) {
    const { code, message } = handleFirebaseError(error);
    return res.status(400).json({ code, message });
  }
}

// ── Verify Token ───────────────────────────────────
async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    if (auth) {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
    } else {
      const data = await firebasePost(':lookup', { idToken: token });
      req.user = { 
        uid:   data.users[0].localId, 
        email: data.users[0].email 
      };
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

async function uploadImage(req, res) {

  console.log("UPLOAD HIT");
console.log("BODY:", req.body);
console.log("FILE:", req.file);

  const database = req.app.locals.db;
  const people   = database.collection('People');

  try {
    const userId = req.body.userId;
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    if (!userId)   return res.status(400).json({ message: 'No userId provided' });

    const fileName = `profile-images/${userId}/${Date.now()}_${req.file.originalname}`;
    const fileRef  = bucket.file(fileName);

    // Upload via Admin SDK
    await fileRef.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });

    // Make publicly accessible

    const downloadURL = `https://storage.cloud.google.com/${bucket.name}/${fileName}`;
    await fileRef.makePublic();
    // Save to MongoDB
    await people.updateOne(
      { "_id": userId },
      { $set: { image_url: downloadURL, updated_at: new Date() } }
    );

    res.status(200).json({ image_url: downloadURL });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
}
module.exports = { register, login, verifyToken,admin, db, bucket,uploadImage  };