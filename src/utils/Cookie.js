const Cookies = {
  get: cname => {
    const name = `${cname}=`;
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  },
  set: (name, value, expirationDate) => {
    if (expirationDate) {
      document.cookie = `${name}=${value};expires=${expirationDate.toUTCString()};path=/`;
    } else {
      document.cookie = `${name}=${value};path=/`;
    }
  },
  remove: name => {
    document.cookie = `${name}=;max-age=0;path=/}`;
  }
};

export default Cookies;
