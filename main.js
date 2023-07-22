const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  session,
} = require("electron");
const { default: WinState } = require("electron-win-state");
const path = require("path");
const url = require("url");
const { openTipDialog } = require("./electronUtils/dialog");
const { createTodoMenu, createGroupMenu } = require("./electronUtils/menu");
const {
  readListFile,
  writeListFile,
  backupCopy,
  importData,
} = require("./preload/api");

let petWindow = null;
// 创建保存窗口状态对象
const winState = new WinState({
  deafultWindth: 800,
  defaultHeight: 500,
});

// 创建渲染进程窗口
function createWindow() {
  const browserWin = new BrowserWindow({
    x: 100,
    y: -100,
    ...winState.winOptions,
    autoHideMenuBar: true,
    webPreferences: {
      allowRunningInsecureContent: false,
      preload: path.resolve(__dirname, "./preload/index.js"),
    },
  });
  // browserWin.loadURL("http://localhost:4200");
  browserWin.loadURL(path.resolve(__dirname, "./index.html"));
  // browserWin.webContents.openDevTools();
  browserWin.on("close", (event) => {
    event.preventDefault(); // 阻止窗口默认的关闭行为
    browserWin.hide(); // 最小化窗口
  });
  return browserWin;
}

// 创建自定义窗口
function createFrameWindow() {
  const win = new BrowserWindow({
    frame: false,
    alwaysOnTop: true,
    width: 300,
    minWidth: 300, // 设置窗口的最小宽度
    maxWidth: 350,
    height: 500,
    minHeight: 300, // 设置窗口的最小高度
    maxHeight: 800, // 设置窗口的最小高度
    resizable: true, // 允许窗口大小调整
    titleBarStyle: "hidden",
    resizable: true,
    movable: true,
    webPreferences: {
      allowRunningInsecureContent: false,
      preload: path.resolve(__dirname, "./preload/index.js"),
    },
  });
  // win.loadURL("http://localhost:4200");
  // browserWin.loadURL(path.resolve(__dirname, "./index.html"));
  win.loadURL(path.resolve(__dirname, "./index.html"));
  return win;
}

// 创建宠物窗口
function createPetWindow() {
  const win = new BrowserWindow({
    frame: false,
    alwaysOnTop: true,
    width: 200,
    height: 200,
    x: 1300,
    y: 500,
    transparent: true,
    skipTaskbar: true,
    resizable: false, // 允许窗口大小调整
    titleBarStyle: "hidden",
    movable: true,
    webPreferences: {
      allowRunningInsecureContent: false,
      preload: path.resolve(__dirname, "./preload/index.js"),
    },
  });

  // win.loadURL("http://localhost:4200/#/pet");
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true,
      hash: "#/pet",
    })
  );
  return win;
}

app.whenReady().then(() => {
  // 允许加载跨域资源
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["Origin"] = "*";
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  // 创建系统托盘图标
  tray = new Tray(path.join(__dirname, "./assets/todo.png"));
  tray.setToolTip("todoList");

  // 设置菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示/隐藏 宠物",
      click: () => {
        if (petWindow === null) {
          petWindow = createPetWindow();
        } else {
          petWindow.close();
          petWindow = null;
        }
      },
    },
    {
      label: "备份数据",
      click: () => {
        backupCopy();
      },
    },
    {
      label: "导入数据",
      click: async () => {
        await importData();
        // 刷新数据
        if (browserWin) {
          browserWin.close();
          browserWin = null;
          browserWin = createWindow();
        }
      },
    },
    {
      label: "退出",
      click: () => {
        tray.destroy();
        app.exit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);

  let browserWin = createWindow();
  let frameWin;
  // 设置最小尺寸
  browserWin.setMinimumSize(500, 600);

  // 设置最大尺寸
  browserWin.setMaximumSize(1920, 1080);
  // 创建菜单
  winState.manage(browserWin);
  // 点击系统托盘图标时恢复窗口
  tray.on("click", () => {
    browserWin.show();
  });

  ipcMain.handle("toggleStick", () => {
    browserWin.setAlwaysOnTop(!browserWin.isAlwaysOnTop());
    return browserWin.isAlwaysOnTop();
  });
  ipcMain.handle("openTip", async (event, value) => {
    return await openTipDialog(...value);
  });

  ipcMain.on("showTodoMenu", ($event, params) => {
    const activeWin = browserWin || frameWin;
    const todoMenu = createTodoMenu(activeWin);
    todoMenu.popup({
      window: browserWin,
      x: params.x,
      y: params.y,
    });
  });
  ipcMain.on("showGroupMenu", ($event, params) => {
    const activeWin = browserWin || frameWin;
    const groupMenu = createGroupMenu(activeWin);
    groupMenu.popup({ window: browserWin, x: params.x, y: params.y });
  });
  ipcMain.on("togglePinned", (event) => {
    browserWin.close();
    browserWin = null;
    frameWin = createFrameWindow();
  });

  // 取消置顶模式
  ipcMain.on("closePinned", () => {
    frameWin && frameWin.close();
    frameWin = null;
    browserWin = createWindow();
  });

  // 数据存取
  ipcMain.handle("getData", (event, data) => {
    return readListFile();
  });
  ipcMain.on("saveData", (event, data) => {
    writeListFile(data);
  });

  // 打开宠物窗口
  ipcMain.on("openPetWin", () => {
    if (petWindow === null) {
      petWindow = createPetWindow();
    } else {
      petWindow.close();
      petWindow = null;
    }
  });
  ipcMain.on("toggleAnimation", (event, data) => {
    petWindow && petWindow.webContents.send("animation", data);
  });

  ipcMain.on("showTodo", () => {
    if (browserWin | !frameWin) {
      browserWin.show();
    }
  });
});
