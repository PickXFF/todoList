const { dialog } = require("electron");

// 打开文件选择框
async function openFileDialog(title, filters, properties) {
  const options = {
    title,
    defaultPath: "/", // 默认打开的路径
    buttonLabel: "选择", // 自定义选择按钮的文本
    filters: filters
      ? filters
      : [
          { name: "导入数据", extensions: ["json"] }, // 文件类型过滤器
        ],
    properties: properties ? [properties] : ["openFile", "multiSelections"], // 打开文件的属性
  };

  const result = await dialog.showOpenDialog(options);
  if (!result.canceled) {
    // 检查用户是否取消了选择
    const filePaths = result.filePaths; // 获取用户选择的文件路径数组
    return filePaths;
  } else {
    return "取消选择";
  }
}

// 打开保存框
async function openSaveFileDialog(title, filters) {
  const options = {
    title, // 对话框的标题
    defaultPath: "/", // 默认保存的路径和文件名
    buttonLabel: "保存", // 自定义保存按钮的文本
    filters: filters ? filters : [{ name: "备份数据", extensions: ["json"] }],
  };

  const result = await dialog.showSaveDialog(options); // 异步保存文件对话框

  if (!result.canceled) {
    // 检查用户是否取消了保存
    const filePath = result.filePath; // 获取用户选择的文件路径
    return filePath; // 处理文件路径
  } else {
    return "取消了保存";
  }
}

// 打开提示框
async function openTipDialog(type, title, message, detail, buttons) {
  const options = {
    type, // 消息框类型：info、error、question、warning
    title, // 消息框的标题
    message, // 消息内容
    detail, // 附加详细信息
    buttons: buttons ? buttons : ["确认", "取消"], // 自定义按钮文本
    defaultId: 0, // 默认选择按钮的索引
    cancelId: 1, // 取消按钮的索引
    noLink: true, // 禁用链接样式
  };

  return await dialog.showMessageBox(null, options);
}

module.exports = {
  openFileDialog,
  openSaveFileDialog,
  openTipDialog,
};
