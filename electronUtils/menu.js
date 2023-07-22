const { Menu } = require("electron");

const createTodoMenu = (browserWin) => {
  const todoMenu = Menu.buildFromTemplate([
    {
      label: "状态切换",
      submenu: [
        {
          label: "紧急",
          click: () => {
            browserWin.webContents.send("todoMenuClick", "紧急");
          },
        },

        {
          label: "需讨论",
          click: () => {
            browserWin.webContents.send("todoMenuClick", "需讨论");
          },
        },
        {
          label: "待验证",
          click: () => {
            browserWin.webContents.send("todoMenuClick", "待验证");
          },
        },
        {
          label: "待自测",
          click: () => {
            browserWin.webContents.send("todoMenuClick", "待自测");
          },
        },
        {
          label: "更多状态",
          submenu: [
            {
              label: "已解决",
              click: () => {
                browserWin.webContents.send("todoMenuClick", "已解决");
              },
            },
            {
              label: "需求变更",
              click: () => {
                browserWin.webContents.send("todoMenuClick", "需求变更");
              },
            },
            {
              label: "无头绪",
              click: () => {
                browserWin.webContents.send("todoMenuClick", "无头绪");
              },
            },
            {
              label: "待沟通",
              click: () => {
                browserWin.webContents.send("todoMenuClick", "待沟通");
              },
            },
            {
              label: "已关闭",
              click: () => {
                browserWin.webContents.send("todoMenuClick", "已关闭");
              },
            },
            {
              label: "已拒绝",
              click: () => {
                browserWin.webContents.send("todoMenuClick", "已拒绝");
              },
            },
          ],
        },
      ],
    },
    {
      label: "编辑",
      click: () => {
        // 编辑逻辑
        browserWin.webContents.send("todoMenuClick", "edit");
      },
    },
    {
      label: "删除",
      click: () => {
        // 删除逻辑
        browserWin.webContents.send("todoMenuClick", "delete");
      },
    },
  ]);
  return todoMenu;
};
const createGroupMenu = (browserWin) => {
  const groupMenu = Menu.buildFromTemplate([
    {
      label: "编辑",
      click: () => {
        // 编辑逻辑
        browserWin.webContents.send("groupMenuClick", "edit");
      },
    },
    {
      label: "删除",
      click: () => {
        // 删除逻辑
        browserWin.webContents.send("groupMenuClick", "delete");
      },
    },
  ]);
  return groupMenu;
};

module.exports = { createTodoMenu, createGroupMenu };
