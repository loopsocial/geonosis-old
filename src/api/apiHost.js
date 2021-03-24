// 生成环境，不同API前缀会使用不同的Host，与vue.config.js中proxy代理一致
export default {
  // fw:
  //   process.env.NODE_ENV === "production"
  //     ? "https://api.fw.tv"
  //     : "https://studio.sandbox.fireworktv.com",
  fw: "https://studio.sandbox.fireworktv.com",
  fwServe: "http://meishe.fireworktv.net/",
  ms: "https://testeapi.meishesdk.com:8443"
};
