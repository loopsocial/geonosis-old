"use strict";

import Vue from "vue";
import axios from "axios";

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let config = {
  // baseURL: "https://testeapi.meishesdk.com:8443",
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
  headers: {
    Authorization:
      //     "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiIxNDAiLCJzdWIiOiJKV1RUb2tlbiIsImF1dGhvcml0aWVzIjpbeyJhdXRob3JpdHkiOiJST0xFX1VTRVIifV0sImlhdCI6MTYxNTU0NDk1MSwiZXhwIjoxNjE2MTQ5NzUxfQ.fPKXC3acHb9Jrdsv_xqm6vj9smHfqCYSQGbbpjmP4DeJa9ZrVvX0TzzEjdukIdDZXjitRHRrUem7AlwLXobRWQ"
      "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJGaXJld29yayIsImV4cCI6MTYyMTAwOTAzNiwiaWF0IjoxNjE1ODI1MDM2LCJpc3MiOiJGaXJld29yayIsImp0aSI6Ijc3YWY0MTAxLThlY2UtNDQ2YS05N2Q0LWU2NjNhZDNjNzMyMCIsIm5iZiI6MTYxNTgyNTAzNSwicGVtIjp7InVzZXIiOlsiYmFzaWMiXX0sInN1YiI6InU6MTczMTQzNCIsInR5cCI6ImFjY2VzcyJ9.rV-GSeUENpVSqgSN5DG8QPeBOFgIhrl7H0_-6pQCjJopV553SDDRZH8XBx4HlbFHfM1dKPFm46kp4XsgwMwaLg"
  }
};

const _axios = axios.create(config);

_axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
_axios.interceptors.response.use(
  function (response) {
    // Do something with response data
    return response.data;
  },
  function (error) {
    // Do something with response error
    return Promise.reject(error);
  }
);

Plugin.install = function (Vue, options) {
  Vue.axios = _axios;
  window.axios = _axios;
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios;
      }
    },
    $axios: {
      get() {
        return _axios;
      }
    }
  });
};

Vue.use(Plugin);

export default Plugin;
