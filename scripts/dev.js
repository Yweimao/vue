const { build } = require("esbuild");
const { resolve } = require("path");
const target = "reactivity";

build({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
  outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),
  bundle: true, // 将依赖的包一起打包进去
  sourcemap: true, // 生成sourcemap文件,便于调试
  format: "esm", // 打包的格式，打包出来的模块是es6
  platform: "browser", // 打包的平台
  watch: {
    // 监听文件变化
    onRebuild() {
      console.log("watching file change...");
    },
  },
}).then(async () => {
  console.log("打包成功");
});
