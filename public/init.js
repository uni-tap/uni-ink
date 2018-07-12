(function () {
var nav = document.querySelector('.toolbar__panel--draw');
var elmnt = uni_tap.createpage({cont:"<div class=wlcm > <h2> Welcome </h2> </div>"}); 
var new_elm = document.createElement('div');
new_elm.className += " toolbar__panel__item";
new_elm.innerHTML = "hloo";
document.body.appendChild(elmnt);  
new_elm.onclick = function(){alert("new elm")}
nav.appendChild(new_elm);
})();
