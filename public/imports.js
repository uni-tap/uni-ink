var frame = document.getElementById('fileFrame');
var url = document.getElementById('frameURL');
var load = document.getElementById('loadFrameURL');
var loadbox = document.querySelector('.frameLoader');
var socket = io();
load.addEventListener('click', youTube, false);
loadbox.addEventListener("dragstart", function(event){
  socket.emit('drags',{
    style: loadbox.style.transform,
    user: sessionStorage.usr
  });
},false);
function youTube(){
    var myId = getId(url.value);
    frame.src = 'https://youtube.com/embed/'+myId;
    socket.emit('youtube_import_uni-tap', {
     src: myId,
        user: sessionStorage.usr
    });
}
function system(){
    
}
function gDrive(){
    
}
function dropBox(){
    
}
function oneDrive(){
    
}
function getId(resource){
var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = resource.match(regExp);

    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return 'error';
    }
}
socket.on('youtube_import_uni-tap', function(data){
if(data.user != sessionStorage.usr){ 
loadbox.style.display = 'block';
frame.src = 'https://youtube.com/embed/'+data.src;
 //youTube();  
}else{return;} 
});

socket.on('drags', function(data){
if(data.user != sessionStorage.usr){ 
    loadbox.style.transform = data.style;
    console.log(data.style);
}
});
