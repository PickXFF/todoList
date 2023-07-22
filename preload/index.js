const { contextBridge, ipcRenderer } = require("electron");
let handleTodoMenuClick = null;
let handleGroupMenuClick = null;
contextBridge.exposeInMainWorld("api", {
  toggleStick() {
    return ipcRenderer.invoke("toggleStick");
  },
  async openTip(type, title, message, detail, buttons) {
    let result = await ipcRenderer.invoke("openTip", [
      type,
      title,
      message,
      detail,
      buttons,
    ]);
    return result;
  },
  showTodoMenu(params, callback) {
    if (handleTodoMenuClick) {
      ipcRenderer.off("todoMenuClick", handleTodoMenuClick);
      handleTodoMenuClick = null;
    }
    ipcRenderer.send("showTodoMenu", params);
    handleTodoMenuClick = (event, res) => {
      callback(res);
      ipcRenderer.off("todoMenuClick", handleTodoMenuClick); // 移除事件监听器
    };

    ipcRenderer.on("todoMenuClick", handleTodoMenuClick);
  },
  showGroupMenu(params, callback) {
    // 先判断，有则移除再监听
    if (handleGroupMenuClick) {
      ipcRenderer.off("groupMenuClick", handleGroupMenuClick); // 移除事件监听器
      handleGroupMenuClick = null;
    }
    ipcRenderer.send("showGroupMenu", params);
    handleGroupMenuClick = (event, res) => {
      callback(res);
      ipcRenderer.off("groupMenuClick", handleGroupMenuClick); // 移除事件监听器
      handleGroupMenuClick = null;
    };

    ipcRenderer.on("groupMenuClick", handleGroupMenuClick);
  },
  // 切换为顶置模式
  togglePinned() {
    ipcRenderer.send("togglePinned");
  },
  closePinned() {
    ipcRenderer.send("closePinned");
  },

  // 打开宠物窗口
  openPetWin() {
    ipcRenderer.send("openPetWin");
  },
  // 切换动作
  toggleAnimation(type) {
    ipcRenderer.send("toggleAnimation", type);
  },
  animation(callback) {
    ipcRenderer.on("animation", (event, type) => {
      callback(type);
    });
  },

  // 刷新数据
  reload(callback) {
    callback();
  },

  showTodo() {
    ipcRenderer.send("showTodo");
  },
});

// 数据存储
contextBridge.exposeInMainWorld("databaseApi", {
  async getList() {
    let list = await ipcRenderer.invoke("getData");
    return list;
  },
  saveList(list) {
    ipcRenderer.send("saveData", list);
  },
});
