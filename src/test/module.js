// 获取module的json
import { writeModuleXml } from "./xml";
import { readModuleXml } from "../utils/XmlUtils";
export function getModule() {
  writeModuleXml("text.xml");
  const modules = readModuleXml("text.xml");
  return modules[1];
}
