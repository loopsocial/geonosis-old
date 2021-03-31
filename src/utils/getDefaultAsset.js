import {
  saveAssetToIndexDB,
  getAssetFromIndexDB,
  installAsset
} from "./AssetsUtils";

// 读取 assets/styleAssets下的字幕包，并存放到FS中
export default async function() {
  const req = require.context(
    `@/assets/styleAssets`,
    false,
    /\.captionstyle$/i
  );
  const path = req.keys();
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    const val = await getAssetFromIndexDB(key);
    if (!val) {
      await saveAssetToIndexDB(key, new Uint8Array(req(key)));
      // console.log(key, new Uint8Array(req(key)));
    }
    await installAsset(key);
  }
  return req.keys();
}
