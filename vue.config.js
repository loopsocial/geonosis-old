const path = require("path");
function resolve(dir) {
  return path.join(__dirname, ".", dir);
}
const msToken =
  "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiIxNDAiLCJzdWIiOiJKV1RUb2tlbiIsImF1dGhvcml0aWVzIjpbeyJhdXRob3JpdHkiOiJST0xFX1VTRVIifV0sImlhdCI6MTYxNTU0NDk1MSwiZXhwIjoxNjE2MTQ5NzUxfQ.fPKXC3acHb9Jrdsv_xqm6vj9smHfqCYSQGbbpjmP4DeJa9ZrVvX0TzzEjdukIdDZXjitRHRrUem7AlwLXobRWQ";
const fwToken =
  "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJGaXJld29yayIsImV4cCI6MTY0Njc5NTk5OCwiaWF0IjoxNjE1MzQ2Mzk4LCJpc3MiOiJGaXJld29yayIsImp0aSI6ImFhNzA3MDY0LTkzMjAtNGNkZC1iYWRhLWRmZmE2ZjY2MDA4ZCIsIm5iZiI6MTYxNTM0NjM5NywicGVtIjp7InVzZXIiOlsiYmFzaWMiXX0sInN1YiI6InU6MTA4OTQ2MDk4IiwidHlwIjoiYWNjZXNzIn0.zYbI2255W9sOJQYNjTD349JUbxLaTl0iFgKcPC8V2TVUUwCwyjsqBbDh15zda7XRD_d-XOsTvVb3DDBkgNvz0w";
module.exports = {
  devServer: {
    proxy: {
      "/fw": {
        target: "https://staging.fireworktv.com",
        secure: false,
        changeOrigin: true, //是否跨域
        pathRewrite: {
          "^/fw": "/"
        },
        onProxyReq: req => {
          req.setHeader("Authorization", fwToken);
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
