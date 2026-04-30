const admin = require('firebase-admin');
const {initializeApp} = require('firebase/app');
const {getStorage,ref} = require('firebase/storage');



// Initialize Cloud Storage and get a reference to the service
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (err) {
  console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT from .env:', err.message);
  process.exit(1);  // stop server if service account is broken
}

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
  const { name, email, password, accountType } = req.body;

  if (!email || !password) {
    return res.status(400).json({ code: 'invalid-input', message: 'Email and password are required' });
  }

  try {
    // 1. Create user in Firebase Auth
    const data = await firebasePost(':signUp', {
      email,
      password,
      returnSecureToken: true
    });

    // 2. Save user to MongoDB
    const mongoDB = req.app.locals.db;
    const people = mongoDB.collection('People');

    const newUser = {
      firebaseUid: data.localId,
      name:        name || '',
      email,
      accountType: accountType || 'adopter',
      createdAt:   new Date()
    };

    const result = await people.insertOne(newUser);

    return res.status(201).json({ 
      message:      'User created successfully', 
      uid:          data.localId,
      userId:       result.insertedId,
      idToken:      data.idToken,
      refreshToken: data.refreshToken,
      userType:     accountType || 'adopter'
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
    // 1. Authenticate with Firebase
    const data = await firebasePost(':signInWithPassword', {
      email,
      password,
      returnSecureToken: true
    });

    // 2. Fetch user from MongoDB
    const mongoDB = req.app.locals.db;
    const people = mongoDB.collection('People');
    const user = await people.findOne({ firebaseUid: data.localId });

    return res.status(200).json({ 
      message:      'Login successful',
      uid:          data.localId,
      userId:       user?._id || null,
      idToken:      data.idToken,
      refreshToken: data.refreshToken,
      userType:     user?.accountType || null,
      user:         user || null
    });
  } catch (error) {
    const { code, message } = handleFirebaseError(error);
    return res.status(400).json({ code, message });
  }
}

// ── Verify Token (middleware) ──────────────────────
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

// ── Refresh Token ─────────────────────────────────
// Call this from the frontend when idToken expires
async function refreshIdToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const response = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(401).json({ message: data.error?.message || 'Token refresh failed' });
    }

    return res.status(200).json({
      idToken:      data.id_token,
      refreshToken: data.refresh_token,
      expiresIn:    data.expires_in
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to refresh token' });
  }
}

module.exports = { register, login, verifyToken, refreshIdToken, admin, db, bucket };