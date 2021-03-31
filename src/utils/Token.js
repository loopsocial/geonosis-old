import cookies from "./Cookie";
export const tokenKey = "fwtoken";
export const apiHost = document.domain;
let sessionStore = {};

/* Token */
const token = {};
token.hasUserToken = () => {
  return !!getTokenFromCookie();
};

token.setToken = token => {
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 30);
  if (axios) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
  return cookies.set("fwtoken", token, expireDate);
};

token.setTokenAndNext = (next, pathName) => {
  if (token.hasUserToken()) token.setToken(getTokenFromCookie());
  if (pathName) return next({ name: pathName });
  return next();
};

export default token;

export const getTokenFromCookie = () => {
  try {
    const sessionFromCookies = cookies.get(tokenKey);
    return sessionFromCookies;
  } catch (error) {
    console.error(error);
    return sessionStore;
  }
};
