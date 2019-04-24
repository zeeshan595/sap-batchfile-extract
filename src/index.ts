const { app, BrowserWindow } = require("electron");

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    maximizable: false,
    resizable: false,
    frame: false
  });
  //mainWindow.webContents.openDevTools(); //Dev Tools
  mainWindow.loadFile(__dirname + "/index.html");
});

app.on("window-all-closed", app.quit);
