<template>
  <div class="login flex flex-column ">
    <h1>Login</h1>
    <div class="login-buttons flex flex-column">
      <div class="login-button" v-if="false">
        <el-button round class="round-btn" autofocus size="medium">
          <a :href="zeffoOauth()">Login from Zeffo</a>
        </el-button>
      </div>
      <div class="login-button">
        <el-button round class="round-btn" autofocus size="medium">
          <a :href="businessOauth()">Login from Biz portal</a>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import host from "../api/apiHost";
export default {
  data() {
    return {
      apiDomain: host["fw"],
      zeffoClientId: "9xFPJ1xhZItdmMV88fY-Js9bKO10CUbR",
      zeffoRedirectURI: encodeURIComponent(`${window.location.origin}/#/`),
      businessRedirectURI: `${window.location.origin}/`
    };
  },
  methods: {
    zeffoOauth() {
      const OAUTH_URL = `${this.apiDomain}/oauth2/auth?redirect_uri=${this.zeffoRedirectURI}&response_type=token&client_id=${this.zeffoClientId}`;
      return OAUTH_URL;
    },
    businessOauth() {
      const OAUTH_URL = `${this.apiDomain}/auth/business_auth/callback?redirect_to=${this.businessRedirectURI}`;
      return OAUTH_URL;
    }
  }
};
</script>

<style lang="scss" scoped>
.login {
  width: 100%;
  height: 100%;
  color: white;
  .login-button:not(first-child) {
    margin-top: 10px;
  }
}
.el-button {
  a,
  a:hover,
  a:focus,
  a:focus-within,
  a:active,
  a:visited {
    color: inherit;
    text-decoration: none;
  }
}
</style>
