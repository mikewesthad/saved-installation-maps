const electron = require("electron");
const { app, BrowserWindow } = electron;
const path = require("path");
const url = require("url");
const electronDebug = require("electron-debug");

// Device scaling is a problem when it comes to rendering, so force everything to 1x scaling
electron.app.commandLine.appendSwitch("force-device-scale-factor", "1");

electronDebug({ showDevTools: false, devToolsMode: "undocked" });

let mainWindow;

function createWindow() {
  // Initial settings will not create a window larger than screen size
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    useContentSize: true,
    frame: false,
    enableLargerThanScreen: true
  });

  // setSize does allow creating a window larger than screen sizes
  mainWindow.setSize(1920, 1080);

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
