<template>
  <div class="login flex flex-column ">
    <h1>login</h1>
    <br />
    <!-- <div class="login-button">
      <a :href="zeffoOauth()">Login from zeffo</a>
    </div> -->
    <div class="login-button">
      <a :href="businessOauth()">Login from businessPortal</a>
    </div>
  </div>
</template>

<script>
import host from "../api/apiHost";
export default {
  data() {
    console.log(host["fw"]);
    return {
      // apiDomain: "https://api.fireworktv.com",
      apiDomain: host["fw"],
      redirectURI: `${window.location.origin}/`
    };
  },
  methods: {
    zeffoOauth() {
      const OAUTH_URL = `${this.apiDomain}/auth?redirect_to=${this.redirectURI}`;
      return OAUTH_URL;
    },
    businessOauth() {
      const OAUTH_URL = `${this.apiDomain}/auth/business_auth/callback?redirect_to=${this.redirectURI}`;
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
