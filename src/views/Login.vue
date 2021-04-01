<template>
  <div class="login flex flex-column ">
    <h1>login</h1>
    <br />
    <div class="login-button">
      <a :href="zeffoOauth()">Login from zeffo</a>
    </div>
    <div class="login-button">
      <a :href="businessOauth()">Login from businessPortal</a>
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
}
</style>
