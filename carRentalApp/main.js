const { app, BrowserWindow, Menu, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');
const url = require("url");

let mainWindow;
let detailsWindow;

// process.env.NODE_ENV = 'production';
process.env.NODE_ENV = 'development';


// When app is ready, load landing page
app.on('ready', function(){

    mainWindow = new BrowserWindow({
        width: 950,
        height: 750,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,  
        }
    });
    
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages', 'mainPage', 'mainPage.html'),
        protocol: "file:",
        slashes: true
    }));

    mainWindow.on('closed', function() {
        detailsWindow = null;
        app.quit();
    });

});


// When car details button is clicked, a details page for the car is presented
ipcMain.on('goToDetails', function(e, carInfo){

    detailsWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,  
        }
    });
    
    detailsWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages', 'detailsPage', 'detailsPage.html'),
        protocol: "file:",
        slashes: true
    }));

    detailsWindow.webContents.on('did-finish-load', function(){
        detailsWindow.webContents.send('carId', carInfo);
    });

    detailsWindow.on('closed', function() {
        detailsWindow=null;
    });

});


// when rental on car is clicked, open new window where the information form will be
ipcMain.on('rentCarStage1', function(e, carRentalInfo){

    console.log(carRentalInfo);

    detailsWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages', 'rentCarStage1', 'rentCarStage1.html'),
        protocol: "file:",
        slashes: true
    }));

    detailsWindow.webContents.on('did-finish-load', function(){
        detailsWindow.webContents.send('rentCarStage1', carRentalInfo);
    });
});

// when rental on car is clicked, open new window where the information form will be
ipcMain.on('rentCarStage2', function(e, carRentalInfo){

    console.log(carRentalInfo);

    detailsWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages', 'rentCarStage2', 'rentCarStage2.html'),
        protocol: "file:",
        slashes: true
    }));

    detailsWindow.webContents.on('did-finish-load', function(){
        detailsWindow.webContents.send('rentCarStage2', carRentalInfo);
    });
});


// when rental on car is clicked, open new window where the information form will be
ipcMain.on('rentCarStage3', function(e, carRentalInfo){

    console.log(carRentalInfo);

    detailsWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages', 'rentCarStage3', 'rentCarStage3.html'),
        protocol: "file:",
        slashes: true
    }));

    detailsWindow.webContents.on('did-finish-load', function(){
        detailsWindow.webContents.send('rentCarStage3', carRentalInfo);
    });
});



// when car rental is finalised, just show a success window i guess
ipcMain.on('rentCarClose', function(){
    detailsWindow.close();
});
