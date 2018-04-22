var frame = document.getElementById('fileFrame');
var url = document.getElementById('frameURL');
var load = document.getElementById('loadFrameURL');
var socket = io();
    load.addEventListener('click', youTube, false);
function youTube(){
    var myId = getId(url.value);
    frame.src = 'https://youtube.com/embed/'+myId;
    socket.emit('youtube_import_uni-tap', {
     src: myId
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
url.value = data.src;
 youTube();  
});
