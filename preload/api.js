const fs = require("fs");
const path = require("path");
const {
  openSaveFileDialog,
  openTipDialog,
  openFileDialog,
} = require("../electronUtils/dialog");
const url = path.resolve(__dirname, "./todo.json");

// 读取todo列表
function readListFile() {
  try {
    const list = fs.readFileSync(url, "utf-8");
    return JSON.parse(list);
  } catch (error) {
    return [];
  }
}

// 写入数据
function writeListFile(list) {
  fs.writeFileSync(url, list);
}

// 导出备份
async function backupCopy() {
  let filePaths = await openSaveFileDialog("请选择保存路径", null);
  console.log(filePaths);
  if (filePaths === "取消了保存") return;
  fs.copyFile(url, filePaths, (err) => {
    if (err) {
      openTipDialog("error", "导出文件时发生错误", err);
      return;
    }
  });
}

// 导入数据
async function importData() {
  let path = await openFileDialog("请选择导入文件");
  let importList = fs.readFileSync(path[0], "utf-8");
  let list = fs.readFileSync(url, "utf-8");
  list = JSON.parse(list);
  importList = JSON.parse(importList);

  const mergedList = list.reduce((acc, importItem) => {
    const foundItem = importList.find((item) => item.id === importItem.id);
    if (foundItem) {
      acc.push(foundItem);
    } else {
      acc.push(importItem);
    }
    return acc;
  }, []);
  writeListFile(JSON.stringify(mergedList));
}

module.exports = {
  readListFile,
  writeListFile,
  backupCopy,
  importData,
};
