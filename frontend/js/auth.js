// localStorage allows to store key-value pairs in a web browser

// get the id token
export function getIdToken() {
  return localStorage.getItem("idToken");
}
// get the refresh token
export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}
// get the user id
export function getUserId() {
  return localStorage.getItem("userId");
}
// get the user type -> adopter or buisness 
export function getUserType() {
  return localStorage.getItem("userType");
}
// clear the tokens and user id
export function clearAuth() {
  localStorage.removeItem("idToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userType");
}
