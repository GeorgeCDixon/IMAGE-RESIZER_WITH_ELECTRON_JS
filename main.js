
const path =require('path');
const os =require('os');
const fs= require('fs');
const resizeImg = require('resize-img');
const {app, BrowserWindow, Menu , ipcMain, shell} = require('electron');

process.env.NODE_ENV='production';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;
// Function to create main window
function createMainWindow(){
    mainWindow = new BrowserWindow({

        title:'Image Resizer',
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences :{
            contextIsolation: true,
            nodeIntegration:true,
            preload : path.join(__dirname, './preloader.js')
        }
    });

    // Open devtools if in dev environment
    if(isDev === true){
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// Create about window
function createAboutWindow(){
    const aboutWindow = new BrowserWindow({

        title:'About Image Resizer',
        width: 300,
        height: 300
    });

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}


// App is ready 
app.whenReady().then(()=>{
    createMainWindow();

    //implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);


    //Remove mainWindow from memory on close since it is as a global variable
    mainWindow.on('closed', () => (mainWindow =null));

    app.on('activate', ()=>{
        if(BrowserWindow.getAllWindows().length===0) {
            createMainWindow();
        }
    });
});

// Creating a Menu template

const menu =[
    ...(isMac
         ? [
            {
                label:app.name,
                submenu:[
                    {
                        label:'About',
                        click : createAboutWindow
                    },
                        ],
            },
            
        ] 
        : []),
    {
        role: 'fileMenu',
    },
    ...(!isMac ? [{
        label: "Help",
        submenu : [
            {
               label : 'About',
               click : createAboutWindow
            },
        ],
    }] 
    : [])
];

// const menu =[
//     {
//         label: 'File',
//         submenu:[
//             {
//                 label: 'Quit',
//                 click: () => app.quit(),
//                 accelerator : 'CmdOrCtrl+w'
//             },
            
//         ]
//     }
// ];

//Respond to IPC renderer resize
ipcMain.on('image:resize', (e, options)=>{
    options.dest =path.join(os.homedir(), 'Resized Images')
    resizeImage(options);
});

//Resize the image function
async function resizeImage({imgPath, width, height, dest}){
    try{
        const newPath =await resizeImg(fs.readFileSync(imgPath),{
            width :+width,
            height:+height
        });

const filename = path.basename(imgPath);

//create dest folder if not exist
if(!fs.existsSync(dest)){
    fs.mkdirSync(dest);
}

//Write ffile tp destination
fs.writeFileSync(path.join(dest, filename), newPath);

//send success to render
mainWindow.webContents.send('image:done');

// open dest folder
shell.openPath(dest);


    }catch(err){
        console.log(err);
    }
}


//Quit Application
app.on('window-all-closed', function () {
    if (!isMac) app.quit()
  });
