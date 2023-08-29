//const { ipcRenderer } = require("electron");

const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const heightInput = document.querySelector('#height');
const widthInput =document.querySelector('#width');
const outputPath =document.querySelector('#output-path');
const filename =document.querySelector('#filename');



function loadImage(e){
  const file = e.target.files[0];

  if (!isFileImage(file)){
    alertError('Please Select an Image');
    return;
  }

  //Get Original dimentions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload= function(){
    widthInput.value =this.width;
    heightInput.value =this.height;
  };

  form.style.display = 'block';
  filename.innerText = file.name;
  outputPath.innerText =path.join(os.homedir(), 'Resized Images');
}

//Send Image data to main
function sendImage(e){
  e.preventDefault();


  const width = widthInput.value;
  const height =heightInput.value;
  const imgPath = img.files[0].path;

  if(!img.files[0]){
    alertError('Please uplaod an image');
    return;
  }

  if(width ==='' || height === ''){
    alertError('Please fill in a height and width');
    return;
  }
  
  //Send to main using ipcRenderer
  ipcRenderer.send('image:resize',{
    imgPath,
    width,
    height
  });
}


// Catch the image:done event
ipcRenderer.on('image:done', ()=>{
  alertSuccess('Image Successfully Resized to ${widthInput.value} x ${heightInput.value}');
})


//Make sure file is image
function isFileImage(file){
  const acceptedFileType = ['image/gif' , 'image/png' , 'image/jpeg'];

  return file && acceptedFileType.includes(file['type']);
}


function alertError(message){
  Toastify.toast({
    text: message,
    duration :5000,
    close: false,
    style:{
      background:'red',
      color:'white',
      textalign:'center'
    }
  });
}

function alertSuccess(message){
  Toastify.toast({
    text: message,
    duration :5000,
    close: false,
    style:{
      background:'green',
      color:'white',
      textalign:'center'
    }
  });
}

img.addEventListener('change', loadImage)
form.addEventListener('submit', sendImage)