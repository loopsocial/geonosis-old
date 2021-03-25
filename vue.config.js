const path = require("path");
function resolve(dir) {
  return path.join(__dirname, ".", dir);
}
const msToken =
  "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiIxMDAiLCJzdWIiOiJKV1RUb2tlbiIsImF1dGhvcml0aWVzIjpbeyJhdXRob3JpdHkiOiJST0xFX1VTRVIifV0sImlhdCI6MTYxNjQwNDExMCwiZXhwIjoxNjE3MDA4OTEwfQ.Zqis4qg0ZSy0baoOdnNU6qhL1k0c823TwQj3RyTeX5TGtzoLpFvQQp-T_wAQE0Vgum3zf7cwD7VkgsXvDHB5RA";
const fwToken =
  "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJGaXJld29yayIsImV4cCI6MTY0Njc5NTk5OCwiaWF0IjoxNjE1MzQ2Mzk4LCJpc3MiOiJGaXJld29yayIsImp0aSI6ImFhNzA3MDY0LTkzMjAtNGNkZC1iYWRhLWRmZmE2ZjY2MDA4ZCIsIm5iZiI6MTYxNTM0NjM5NywicGVtIjp7InVzZXIiOlsiYmFzaWMiXX0sInN1YiI6InU6MTA4OTQ2MDk4IiwidHlwIjoiYWNjZXNzIn0.zYbI2255W9sOJQYNjTD349JUbxLaTl0iFgKcPC8V2TVUUwCwyjsqBbDh15zda7XRD_d-XOsTvVb3DDBkgNvz0w";
const sandboxToken =
  "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJGaXJld29yayIsImV4cCI6MTYyMTAwOTAzNiwiaWF0IjoxNjE1ODI1MDM2LCJpc3MiOiJGaXJld29yayIsImp0aSI6Ijc3YWY0MTAxLThlY2UtNDQ2YS05N2Q0LWU2NjNhZDNjNzMyMCIsIm5iZiI6MTYxNTgyNTAzNSwicGVtIjp7InVzZXIiOlsiYmFzaWMiXX0sInN1YiI6InU6MTczMTQzNCIsInR5cCI6ImFjY2VzcyJ9.rV-GSeUENpVSqgSN5DG8QPeBOFgIhrl7H0_-6pQCjJopV553SDDRZH8XBx4HlbFHfM1dKPFm46kp4XsgwMwaLg";

module.exports = {
  devServer: {
    proxy: {
      "/fwServe": {
        target: "http://meishe.fireworktv.net/",
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          "^/fwServe": "/"
        },
        onProxyReq: req => {
          req.setHeader("Authorization", msToken);
        }
      },
      "/fw": {
        // target: "https://api.fw.tv",
        target: "https://studio.sandbox.fireworktv.com",
        secure: false,
        changeOrigin: true, //是否跨域
        pathRewrite: {
          "^/fw": "/"
        },
        onProxyReq: req => {
          req.setHeader("Authorization", sandboxToken);
        }
      },
      "/ms": {
        target: "https://testeapi.meishesdk.com:8443",
        secure: false,
        changeOrigin: true, //是否跨域
        pathRewrite: {
          "^/ms": "/"
        },
        onProxyReq: req => {
          req.setHeader("Authorization", msToken);
        }
      }
    },
    port: 5000 // 端口
  },
  lintOnSave: false,
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/assets/style/_variables.scss";
        @import "@/assets/style/mixins.scss";`
      }
    }
  },
  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: true
    }
  },
  chainWebpack: config => {
    config.module.rules.delete("svg"); //重点:删除默认配置中处理svg,
    config.module
      .rule("svg-sprite-loader")
      .test(/\.svg$/)
      .include.add(resolve("src/icons")) //处理svg目录
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]"
      });
  }
};
