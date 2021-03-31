import cookies from "./Cookie";
export const sessionKey = "_fstptyfwvs";
export const apiHost = document.domain;
let sessionStore = {};

/* Token */
const token = {};
token.hasUserToken = () => {
  return !!getSessionFromLocalStorage.token;
};

token.setToken = token => {
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 30);
  if (axios) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
  console.log(token);
  return cookies.set("fwtoken", token, expireDate);
};

token.setTokenAndNext = (next, pathName) => {
  // setUserToken
  if (pathName) return next({ name: pathName });
  return next();
};

export default token;

export const getSessionFromLocalStorage = () => {
  try {
    const sessionFromStorage = JSON.parse(
      window.localStorage && window.localStorage.getItem(sessionKey)
    );
    const sessionFromCookies = JSON.parse(cookies.get(sessionKey));
    return sessionFromCookies || sessionFromStorage;
  } catch (error) {
    return sessionStore;
  }
};
