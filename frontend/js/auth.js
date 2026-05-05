// {   "unique_id": "USR-001",   "name": "Jamie Rivera",   "image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",   "location": {     "city": "San Diego",     "state": "CA",     "zip": "92103",     "geolocation": {       "type": "Point",       "coordinates": [         -117.149,         32.739       ]     }   },   "preferences": {     "energy_level": [       "moderate energy",       "high energy"     ],     "social": [       "loves cats",       "dog friendly",       "loves kids"     ],     "space": [       "apartment ok",       "needs a yard"     ],     "temperament": [       "affectionate",       "playful",       "curious"     ],     "training": [       "house trained",       "first-time owner ok"     ],     "grooming": [       "low shedding",       "easy coat"     ],     "special": [],     "raw_tags": [       "moderate energy",       "high energy",       "loves cats",       "dog friendly",       "loves kids",       "apartment ok",       "needs a yard",       "affectionate",       "playful",       "curious",       "house trained",       "first-time owner ok",       "low shedding",       "easy coat"     ]   },   "liked_dogs": [     {       "$oid": "64a1f2c3e4b0a1234567890a"     },     {       "$oid": "64a1f2c3e4b0a12345678910"     }   ],   "passed_dogs": [     {       "$oid": "64a1f2c3e4b0a1234567890b"     },     {       "$oid": "64a1f2c3e4b0a1234567890e"     }   ],   "preference_vector": [     0,     0,     0,     0,     0,     0,     0,     1,     0,     0,     0,     0,     0,     0,     0,     0,     1,     0,     0,     0,     0,     1,     1,     0,     0,     0,     0,     1,     0,     0,     0,     0,     0,     0,     0,     0,     1,     0,     0,     0,     0,     0,     0,     0,     0,     1,     0,     0,     0,     0,     0,     0,     0,     1,     0,     0,     0,     0,     0,     0,     0,     1,     0,     0,     0,     0,     0,     0,     0   ],   "vector_index": [     "curious",     "playful",     "gentle",     "affectionate",     "loyal",     "goofy",     "calm",     "confident",     "independent",     "spirited",     "loves kids",     "dog friendly",     "loves cats",     "cat caution",     "good with seniors",     "only pet preferred",     "warms up slowly",     "social butterfly",     "high energy",     "moderate energy",     "low energy",     "couch potato",     "needs daily runs",     "loves fetch",     "loves swimming",     "loves hiking",     "agility star",     "water baby",     "certified napper",     "loves car rides",     "toy hoarder",     "treat motivated",     "apartment ok",     "needs a yard",     "needs a big space",     "fenced yard required",     "indoor homebody",     "outdoor lover",     "quiet home preferred",     "house trained",     "crate trained",     "leash trained",     "knows basic commands",     "loves learning",     "needs training",     "first-time owner ok",     "experienced owner needed",     "affectionate",     "gentle",     "loyal",     "cuddle bug",     "lap dog",     "velcro dog",     "social butterfly",     "low shedding",     "heavy shedder",     "hypoallergenic",     "easy coat",     "regular grooming needed",     "medical needs",     "senior dog",     "separation anxiety",     "vocal",     "shy at first",     "escape artist",     "resource guarder"   ],   "created_at": {     "$date": "2024-06-25T10:00:00.000Z"   },   "updated_at": {     "$date": "2024-06-25T10:00:00.000Z"   } }


// // localStorage allows to store key-value pairs in a web browser

// // get the id token
// export function getIdToken() {
//   return localStorage.getItem("idToken");
// }
// // get the refresh token
// export function getRefreshToken() {
//   return localStorage.getItem("refreshToken");
// }
// // get the user id
// export function getUserId() {
//   return localStorage.getItem("userId");
// }
// // get the user type -> adopter or buisness 
// export function getUserType() {
//   return localStorage.getItem("userType");
// }
// // clear the tokens and user id
// export function clearAuth() {
//   localStorage.removeItem("idToken");
//   localStorage.removeItem("refreshToken");
//   localStorage.removeItem("userId");
//   localStorage.removeItem("userType");
// }
