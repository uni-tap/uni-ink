var frame = document.getElementById('fileFrame');
var url = document.getElementById('frameURL');
var load = document.getElementById('loadFrameURL');
    load.addEventListener('click', youTube, false);
function youTube(){
     var SearchTerm = 'watch?v=';
     var TextSearch = url.value;

  if (SearchTerm.length > 0 && TextSearch.indexOf(SearchTerm) > -1) {
    alert("String Found. Search Complete");
    var text = url.value;
    var ntxt = text.replace('watch?v=', "embed")  
    frame.src = ntxt;  
  } else {
    alert("No Data found in Text Area");
  }
}
function system(){
    
}
function gDrive(){
    
}
function dropBox(){
    
}
function oneDrive(){
    
}
