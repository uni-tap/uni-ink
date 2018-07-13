(function(){
  //CSS file  
    
  var link = document.createElement("link");
  link.setAttribute("href", "timer.css");
  link.setAttribute("rel", "stylesheet");  
  document.body.appendChild(link);
    
  // Initialization button  
    
  var pelm = document.querySelector(".bottom-bar__inner");
  var cdiv = document.createElement("div");
  cdiv.className = "svg-button";
  cdiv.innerHTML = '<svg viewBox="0 0 24 24" id="img__countdown" width="100%" height="100%"><g fill="currentColor" fill-rule="evenodd"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-.999-17.95L11 2V1a1 1 0 0 1 2 0v1l-.001.05C18.053 2.55 22 6.813 22 12c0 5.523-4.477 10-10 10S2 17.523 2 12c0-5.186 3.947-9.45 9.001-9.95z"></path><path d="M12.518 10.068l2.457-2.457a1 1 0 0 1 1.414 1.414l-2.457 2.457A2.003 2.003 0 0 1 12 14a2 2 0 1 1 .518-3.932z"></path></g></svg>';
  cdiv.addEventListener("click", startCount, false);
  pelm.appendChild(cdiv);  
    
  // Main GUI 
    
  var mdiv = document.createElement("div");
  mdiv.className = "ctimer";
  mdiv.innerHTML = "<p id=ctime></p>";
  document.body.appendChild(mdiv);  
})();

function startCount(){
// Set the date we're counting down to
var countDownDate = new Date("Sep 5, 2018 15:37:25").getTime();

// Update the count down every 1 second
var x = setInterval(function() {

    // Get todays date and time
    var now = new Date().getTime();
    
    // Find the distance between now an the count down date
    var distance = countDownDate - now;
    
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Output the result in an element with id="demo"
    document.getElementById("ctime").innerHTML = days + "d " + hours + "h "
    + minutes + "m " + seconds + "s ";
    
    // If the count down is over, write some text 
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("ctime").innerHTML = "EXPIRED";
    }
}, 1000);
}

