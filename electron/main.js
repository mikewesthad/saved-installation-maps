const electron = require("electron");
const { app, BrowserWindow } = electron;
const path = require("path");
const url = require("url");
const fs = require("fs");
const electronDebug = require("electron-debug");

// Device scaling is a problem...
electron.app.commandLine.appendSwitch("force-device-scale-factor", "1");

electronDebug({
  showDevTools: false,
  devToolsMode: "undocked"
});

let mainWindow;

function createWindow() {
  // Initial settings will not create a window larger than screen size
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    useContentSize: true,
    frame: false,
    enableLargerThanScreen: true

    // Not necessary
    // fullscreen: true,
  });

  // setSize will create a window larger than screen size
  const display = electron.screen.getPrimaryDisplay();
  mainWindow.setSize(1920 / display.scaleFactor, 1080 / display.scaleFactor);

  mainWindow.loadURL(
    url.format({
      pathname: path.resolve(__dirname, "..", "dist", "index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
