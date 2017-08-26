'use strict';

(function() {
  var thickness = 2;
  var socket = io();
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var scanvas = document.getElementsByClassName('storeboard')[0];
  var colors = document.getElementsByClassName('color');
  var bgcolors = document.getElementsByClassName('bgcolor');
  var tools  = document.getElementsByClassName('tls_btn');
  var graph  = document.getElementById('graph');
  var new_page = document.getElementById('NewPage');
  var undo   = document.getElementById('undo');
  var redo   = document.getElementById('redo');
  var left   = document.getElementById('Leftbt');
  var right   = document.getElementById('Rightbt');
  var clrbtn = document.getElementById('pen');
  var bgbtn = document.getElementById('bg');
  var fillbtn = document.getElementById('fill');
  var clearbtn = document.getElementById('clear');
  var context = canvas.getContext('2d');
  var scontext = scanvas.getContext('2d');
  var canvasimg = document.getElementById("canvasimg");
  var sizer = document.getElementById("thickness");
  var currentcount = 1;
  var count = currentcount;
  var counter = document.getElementById("counter") ;
  var api = find('api');
  var post  = find('post');
  var fruits = [];
  var saved = false;
 // var mPageNotextBox = document.getElementById('textbox');
   //  mPageNotextBox.value = mCurrentPageNo +"\/" + mpageNo ;
  var totalcurrentpagecount = 1;
  var mcurrentpagecount = 1; //totalcurrentpagecount;
  var previouspagecount = 1 ; //mcurrentpagecount ;

  var nextpagecount = 1 ; //totalcurrentpagecount;
  var totalpagecount = 1;
  //counter.innerHTML = totalcurrentpagecount + "\/" + totalpagecount ;

  var current = {
    color: 'black',
    type: 'Pen',
    tool: 'pen',
    ecolor: 'white',
    cursorsrc: 'http://uni-tap.com/uc/icons/pnl.png',
    bgcolor: 'white',
    fillcolor: 'transparent',
    canvas: canvas
  };

  var main_canvas = canvas;
  var main_ctx = main_canvas.getContext('2d');

  //  REDO AND UNDO FUNCTIONS

  var history = {
  redo_list: [],
  undo_list: [],
  saveState: function(canvas, list, keep_redo) {
    keep_redo = keep_redo || false;
    if(!keep_redo) {
      this.redo_list = [];
    }
    (list || this.undo_list).push(canvas.toDataURL());
    console.log('done Saving state');
  },
  undo: function(canvas, ctx, emit) {
    this.restoreState(canvas, ctx, this.undo_list, this.redo_list);
  },
  redo: function(canvas, ctx, emit) {
    this.restoreState(canvas, ctx, this.redo_list, this.undo_list);
  },
  restoreState: function(canvas, ctx,  pop, push) {
    if(pop.length) {
      this.saveState(canvas, push, true);
      var restore_state = pop.pop();
      var img = document.createElement('img'); img.src = restore_state; document.body.appendChild(img);
      img.onload = function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
      }
    }
  }
}
   function find(name){
          var url = window.location.search;
          var num = url.search(name);
          var namel = name.length;
          var frontlength = namel+num+1; //length of everything before the value
          var front = url.substring(0, frontlength);
          url = url.replace(front, "");
          num = url.search("&");

          if(num>=0) return url.substr(0,num);
          if(num<0)  return url;
       }
       window.onload = function(){
        // save();
        //socket.emit('canvas_data');
       }
 function save() {
   if(saved == false){
     if(current.canvas == canvas){
       var dataURL = scanvas.toDataURL();
     }else if(current.canvas !== 'canvas'){
       var dataURL = current.canvas.toDataURL();
     }
    fruits.push(dataURL);
    console.log('state_saved');
     var img_box = document.getElementById('sharing_img');
         if(!img_box){
         img_box = document.createElement('img');
         img_box.setAttribute('src', dataURL);
         document.body.appendChild(img_box);
         img_box.setAttribute('id', 'sharing_img');
         img_box.style.zIndex = '-1';
         img_box.style.position = 'absolute';
         img_box.style.top = '-500px';
         img_box.style.height = '500px';
         img_box.style.width = '500px';
         socket.emit('all_data', {
                img: dataURL
             });
         }else{
             img_box.setAttribute('src', dataURL);
             socket.emit('all_data', {
                img: dataURL,
                api: api
             });
         }
       }else{return;}
 }
 socket.on('all_data', ondataEvent);
    function ondataEvent(data){
      thankyou();
     if(data.api == api){
        var img_box = document.getElementById('sharing_img');
     if(current.canvas == canvas){
       //var v=document.getElementById("localvideo");
      scanvas.style.backgroundRepeat = 'no-repeat';
      scanvas.style.backgroundImage = 'url('+data.img+')';
     }else if(current.canvas !== 'canvas'){
       current.canvas.style.backgroundRepeat = 'no-repeat';
       current.canvas.style.backgroundImage = 'url('+data.img+')';
     }
    }else{return;}
 }
 function thankyou(){
   socket.emit('saved');
 }
  var drawing = false;

  //ADDING EVENT LISTENERS TO THE CANVAS
  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, true);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
  canvas.addEventListener('pointerdown', onMouseDown, false);
  canvas.addEventListener('pointerup', onMouseUp, false);
  canvas.addEventListener('pointermove', throttle(onMouseMove, 10), false);
  //canvas.addEventListener('mouseover', save, false);
  canvas.addEventListener('resize', onResize, false);
  // CHANGING PEN AND BOARD COLOURS WHEN  COLOR BUTTON IS CLICKED AND
  // CHANGING THE TOOL WHEN A TOOL BUTTON IS CLICKED

  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
  }
  for (var i = 0; i < bgcolors.length; i++){
    colors[i].addEventListener('click', onBgcolorUpdate, false);
  }
  for (var i = 0; i < tools.length; i++){
    tools[i].addEventListener('click', onToolUpdate, false);
  }
    graph.addEventListener('click', onGraphUpdate, false);
    new_page.addEventListener('click', onNewPageUpdate, false);
    clearbtn.addEventListener('click', ClearCanvas, false);
    clrbtn.addEventListener('click', function(){
      current.type = 'Pen';
    }, false);
    bgbtn.addEventListener('click', function(){
      current.type = 'Bg';
    }, false);
    fillbtn.addEventListener('click', function(){
      current.type = 'Fill';
    }, false);
    left.addEventListener('click', move_left, false);
    right.addEventListener('click', move_right, false);
    sizer.addEventListener('change', size_update, false);

  //PERFORMING A PARTICULAR FUNCTION ON THE ARRIVAL OF THE FOLLOWING EVENTS

  socket.on('drawing', onDrawingEvent);
  socket.on('esr', onEraserEvent);
  socket.on('rect', onRectEvent);
  socket.on('circle', onCircleEvent);
  socket.on('line', onLineEvent);
  socket.on('tri', onTriEvent);
  socket.on('rtri', onRtriEvent);
  socket.on('clear', onClearEvent);
  socket.on('update_data', onUpdateDataEvent);
  socket.on('undo', onUndoEvent);
  socket.on('redo', onRedoEvent);
  socket.on('graph', onGraphEvent);
  socket.on('new_page', onNewPageEvent);
  socket.on('left', onLeftEvent);
  socket.on('right', onRightEvent);
  socket.on('hlight', onHlightEvent);
  socket.on('saved', function(){
    saved = true;
  });
  socket.on('enable_controls', onControlsEvent);
  //  socket.on('canvas_data', save);
  socket.on('color', function(data){
    current.canvas = document.getElementById('page'+previouspagecount);
    main_ctx = current.canvas.getContext('2d');
    current.canvas.style.backgroundColor = data.color;
  });

  //RESIZING THE CANVAS ACOORDING TO THE BROWSER

  window.addEventListener('load', onResize, false);

  //MAKING RANDOM COLORS FOR RANDOM COLOR PEN

  function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }

 // DRAWING TOOLS
  var created = false;
  var draw = {
      pen: function(x0, y0, x1, y1, color, emit){ // PEN TOOL
        main_ctx.beginPath();
        main_ctx.lineCap="round";
        main_ctx.moveTo(x0, y0);
        main_ctx.lineTo(x1, y1);
        main_ctx.strokeStyle = color;
        main_ctx.lineWidth = thickness;
        main_ctx.stroke();
        main_ctx.closePath();

        //SENDING TO OTHER USERS

        if (!emit) { return; }
        var cw = canvas.width;
        var ch = canvas.height;

        socket.emit('drawing', {
          x0: x0 / cw,
          y0: y0 / ch,
          x1: x1 / cw,
          y1: y1 / ch,
          color: color,
          api: api
        });
      },
      eraser: function(x0, y0, x1, y1, color, emit){
        main_ctx.beginPath();
        main_ctx.lineCap = "round";
        main_ctx.moveTo(x0, y0);
        main_ctx.lineTo(x1, y1);
        main_ctx.strokeStyle = color;
        main_ctx.lineWidth = 10;
        main_ctx.stroke();
        main_ctx.closePath();
        //SENDING TO OTHER USERS

        if (!emit) { return; }
        var cw = canvas.width;
        var ch = canvas.height;

        socket.emit('esr', {
          x0: x0 / cw,
          y0: y0 / ch,
          x1: x1 / cw,
          y1: y1 / ch,
          color: color,
          api: api
        });
      },
      rect: function(x0, y0, x1, y1, color, fill, emit){ // RECTANGLE TOOL
        var x = Math.min(x0,x1),
            y = Math.min(y0,y1),
            w = Math.abs(x1 - x0),
            h = Math.abs(y1 - y0);
        if (!w || !h) {
           return;
        }

       context.lineWidth = thickness;
       context.strokeStyle = color;
       context.beginPath();
       context.lineCap="round";
       context.rect(x, y, w , h);
       context.stroke();
       context.moveTo(x1, y1);
       context.clearRect(0, 0, scanvas.width, scanvas.height);
       context.rect(x, y, w, h);
       if(fill == ''){fill = 'transparent';}else{
       context.fillStyle = fill;
       context.fill();
       context.opacity = 0.5;
       context.stroke();
       context.closePath();
     }

      //SENDING TO OTHER USERS
       if (!emit) { return; }
       var cw = scanvas.width;
       var ch = scanvas.height;

       socket.emit('rect', {

         x0: x0 /cw,
         y0: y0 /ch,
         x1: x1 /cw,
         y1: y1 /ch,
         color: color,
         fill: fill,
          api: api
       });
 },
      circle: function (x0, y0, x1, y1, color, fill, emit){ // CIRCLE TOOL
       var x = Math.min(x1,x0),
             y = Math.min(y1,y0),
             w = Math.abs(x1 - x0),
             h = Math.abs(y1 - y0),
             r1=Math.sqrt(w*w+h*h);
             if (!w || !h) {
               return;
             }

   	   context.strokeStyle = color;
       context.lineWidth   = thickness;
       context.beginPath();
       context.lineCap="round";
       context.arc(x, y, r1, 0, 2 * Math.PI);
       context.stroke();
       context.clearRect(0, 0, scanvas.width, scanvas.height);
       context.arc(x, y, r1, 0, 2 * Math.PI);
       if(fill == ''){fill = 'transparent';}else{
       context.fillStyle = fill;
       context.fill();
       context.stroke();
}
       //SENDING TO OTHER USERS

       if (!emit) { return; }
       var cw = canvas.width;
       var ch = canvas.height;

       socket.emit('circle', {
         x0: x0 /cw,
         y0: y0 /ch,
         x1: x1 /cw,
         y1: y1 /ch,
         color: color,
         fill: fill,
         api: api
       });
 },
     line: function (x0, y0, x1, y1, color, emit) { // LINE TOOL
       context.strokeStyle = color;
       context.lineWidth   = thickness;
       context.clearRect(0, 0, scanvas.width, scanvas.height);
       context.beginPath();
       context.lineCap="round";
       context.moveTo(x0, y0)
       context.lineTo(x1, y1);
       context.stroke();

       //SENDING TO OTHER USERS

       if (!emit) { return; }
       var cw = canvas.width;
       var ch = canvas.height;

       socket.emit('line', {
         x0: x0 /cw,
         y0: y0 /ch,
         x1: x1 /cw,
         y1: y1 /ch,
         color: color,
         api: api
       });
     },
     triangle: function(x0, y0, x1, y1, color, fill, emit){
       context.clearRect(0, 0, scanvas.width, scanvas.height);
       context.strokeStyle = color;
       context.lineWidth   = thickness;
       context.lineCap="round";
       context.beginPath();
       context.moveTo(x0, y0);
       context.lineTo(x0 + (x1-x0) / 2, y0 + (y1-y0) / 2);
       context.lineTo(x0 - (x1-x0) / 2, y0 + (y1-y0) / 2);
       context.closePath();
       if(fill == ''){fill = 'transparent';}else{
       context.fillStyle = fill;
       context.fill();
       context.stroke();

       if (!emit) { return; }
       var cw = canvas.width;
       var ch = canvas.height;

       socket.emit('tri', {
         x0: x0 / cw,
         y0: y0 / ch,
         x1: x1 / cw,
         y1: y1 / ch,
         color: color,
         fill: fill,
         api: api
       });
     }
   },
     right_triangle: function(x0, y0, x1, y1, color, fill, emit){
       context.clearRect(0, 0, scanvas.width, scanvas.height);
       context.strokeStyle = color;
       context.lineWidth   = thickness;
       context.beginPath();
       context.lineCap="round";
       context.moveTo(x0, y0);
       context.lineTo(x0 , y0 + (y1-y0) / 2);
       context.lineTo(x0 + (x1-x0) / 2, y0 + (y1-y0) / 2);
       context.closePath();
       if(fill == ''){fill = 'transparent';}else{
       context.fillStyle = fill;
       context.fill();
       context.stroke();
}
       //SENDING TO OTHER USERS

       if (!emit) { return; }
       var cw = canvas.width;
       var ch = canvas.height;

       socket.emit('rtri', {
         x0: x0 / cw,
         y0: y0 / ch,
         x1: x1 / cw,
         y1: y1 / ch,
         color: color,
         fill: fill,
         api: api
       });
     },

   graph: function (x0, y0, x1, y1, color, thickness, emit) {
     context.width  = totalW;
     context.height = totalH;
     var blockW = 5;
		 var blockH = 5;
     var totalW = x1;
     var totalH = y1;
     var x;
     var y;

     context.strokeStyle = 'green';
     context.lineWidth   = thickness;
     context.clearRect(0, 0, scanvas.width, scanvas.height);
     context.beginPath();
     context.moveTo(x1,y1);

     for(var i = 0;i < Math.round(totalW/blockW); i=i+10){
                context.lineWidth   = "2";
                x = i*blockW + x0;
                y = 0 + y0;
                context.moveTo(x,y);
                context.lineTo(x,y+totalH);
        }
     for(var j = 0; j < Math.round(totalH/blockH); j=j+10){
                context.lineWidth   = "2";
                x = 0 + x0;
                y = j*blockH + y0;
                context.moveTo(x,y);
                context.lineTo(x+totalW,y);
        }
     for(var k = 0;k < Math.round(totalW/blockW); k=k+5){
                context.lineWidth   = "1";
                x = k*blockW + x0;
                y = 0 + y0;
                context.moveTo(x,y);
                context.lineTo(x,y+totalH);

        }
     for(var j = 0; j < Math.round(totalH/blockH); j=j+5){
                context.lineWidth   = "1";
                x = 0 + x0;
                y = j*blockH + y0;
                context.moveTo(x,y);
                context.lineTo(x+totalW,y);
        }
    for(var k = 0;k < Math.round(totalW/blockW); k=k+1){
                context.lineWidth   = "0.5";
                x = k*blockW + x0;
                y = 0 + y0;
                context.moveTo(x,y);
                context.lineTo(x,y+totalH);
        }
    for(var j = 0; j < Math.round(totalH/blockH); j=j+1){
                context.lineWidth   = "0.5";
                 x = 0 + x0;
                y = j*blockH + y0;
                context.moveTo(x,y);
                context.lineTo(x+totalW,y);
        }
    context.stroke();
       if (!emit) { return; }
       var cw = scanvas.width;
       var ch = scanvas.height;

       socket.emit('graph', {
         x0: x0 /cw,
         y0: y0 /ch,
         x1: x1 /cw,
         y1: y1 /ch,
         color: color,
         api: api
       });
   },
     Text:function(x0, y0, x1, y1, color, emit){
       created = false;
       var textmaker = document.createElement('textarea');
       var x = Math.min(x0,x1),
           y = Math.min(y0,y1);
       if(created == false){
        created = true;
        textmaker.style.position = "absolute";
        textmaker.style.left = x + 'px';
        textmaker.style.top =  y + 'px';
        textmaker.style.height = '20px';
        textmaker.style.width = '100px';
        textmaker.placeholder = 'Type here';
        textmaker.style.Zindex = '10000';
        textmaker.style.border = 'none';
        textmaker.style.backgroundColor = 'white';
      }else if(created == true){
        textmaker.style.left = x + 'px';
        textmaker.style.top =  y + 'px';
      }
        document.body.appendChild(textmaker);
        textmaker.focus();
        textmaker.onchange = function(){
        scanvas.fillText(textmaker.value, x, y);
        textmaker.style.display = 'none';
        created = false;
      }
    },
      hlight:function(x0, y0, x1, y1, emit){
        main_ctx.beginPath();
        main_ctx.lineCap="square";
        main_ctx.moveTo(x0, y0);
        main_ctx.lineTo(x1, y1);
        main_ctx.strokeStyle = 'rgba(255, 235, 59, 0.58)';
        main_ctx.lineWidth = '10';
        main_ctx.stroke();
        main_ctx.closePath();

        //SENDING TO OTHER USERS

        if (!emit) { return; }
        var cw = canvas.width;
        var ch = canvas.height;

        socket.emit('hlight', {
          x0: x0 / cw,
          y0: y0 / ch,
          x1: x1 / cw,
          y1: y1 / ch,
          color: color,
          api: api
        });
      }
  };
  function ClearCanvas(){
      current.canvas = document.getElementById('page'+previouspagecount);
      main_ctx = current.canvas.getContext('2d');
      main_ctx.clearRect(0, 0, canvas.width, canvas.height);
      socket.emit('clear',{api: api});
  }
  function download(link){
     var dload_Canvas;	  
     if(current.canvas = canvas){
	 dload_Canvas = scanvas;
	 dload_Canvas = current.canvas;	  
         link.href = dload_Canvas.toDataURL();
         link.download = 'class_notes.png';	  			 
     }else if(!current.canvas = canvas){
     dload_Canvas = current.canvas;	  
     link.href = dload_Canvas.toDataURL();
     link.download = 'class_notes.png';	  
  }
}	  
document.getElementById('download').addEventListener('click', function() {
    download(this);
}, false);
  // DRAWING THE SELECTED TOOL ON THE BOARD

  function onMouseDown(e){
    drawing = true;
    current.x = e.clientX;
    current.y = e.clientY;
    if (current.tool == 'Text'){ // IF TEXT BUTTON IS CLICKED
      draw.Text(current.x, current.y, e.clientX, e.clientY, current.color, true);
    }
  }

  function onMouseUp(e){
     if(current.canvas == canvas){
       update_data(context, scontext, canvas);
       history.saveState(scanvas);
       socket.emit('update_data');
     }else if(current.canvas !== 'canvas'){
       update_data(context, main_ctx, canvas);
       history.saveState(scanvas);
       socket.emit('update_data');
     }
      //save();
  }

  function onMouseMove(e){
   if(post == 's'){ return;}else{
    if (!drawing) { return; }
    if (current.tool == 'Pen'){ // IF PEN BUTTUN IS CLICKED
       draw.pen(current.x, current.y, e.clientX, e.clientY, current.color, true);
       current.x = e.clientX;current.y = e.clientY;
    }
    if (current.tool == 'Eraser'){ // IF ERASER BUTTON IS CLICKED
       draw.eraser(current.x, current.y, e.clientX, e.clientY, current.ecolor, true);
       current.x = e.clientX;current.y = e.clientY;
    }
    if (current.tool == 'Line'){ // IF LINE BUTTON IS CLICKED
       draw.line(current.x, current.y, e.clientX, e.clientY, current.color, true);
    }
    if (current.tool == 'Rectangle'){ // IF RECTANGLE BUTTON IS CLICKED
        draw.rect(current.x, current.y, e.clientX, e.clientY, current.color, current.fillcolor, true);
    }
    if (current.tool == 'Circle'){ // IF CIRCLE BUTTON IS CLICKED
       draw.circle(current.x, current.y, e.clientX, e.clientY, current.color, current.fillcolor, true);
    }
    if (current.tool == 'right_triangle'){ // IF RIGHT TRIANGLE BUTTON IS CLICKED
       draw.right_triangle(current.x, current.y, e.clientX, e.clientY, current.color, current.fillcolor, true);
    }
    if (current.tool == 'Triangle'){ // IF TRIANGLE BUTTON IS CLICKED
       draw.triangle(current.x, current.y, e.clientX, e.clientY, current.color, current.fillcolor, true);
    }
    if (current.tool == 'graph'){ // IF TRIANGLE BUTTON IS CLICKED
        draw.graph(current.x, current.y, e.clientX,e.clientY,current.color,current.thickness, true);
    }
    if (current.tool == 'hLight'){ // IF TRIANGLE BUTTON IS CLICKED
        draw.hlight(current.x, current.y, e.clientX,e.clientY, true);
        current.x = e.clientX;current.y = e.clientY;
    }
    if (current.tool == 'img'){ // IF TRIANGLE BUTTON IS CLICKED
        add_move(current.x, current.y, e.clientX, e.clientY, current.color, current.fillcolor, true);
    }
   }
}
  // UPDATING THE PEN AND BOARD COLORS

  function onColorUpdate(e){
    if(current.type == 'Pen'){
      current.color = e.target.className.split(' ')[1];
    }
    if(current.type == 'Bg'){
      current.bgcolor = e.target.className.split(' ')[1];
      //alert(main_canvas.id);
      current.canvas = document.getElementById('page'+previouspagecount);
      main_ctx = current.canvas.getContext('2d');
      current.canvas.style.backgroundColor = current.bgcolor;
      socket.emit('color', {color:current.bgcolor});
    }
    if(current.type == 'Fill'){
      current.color = 'black';
      current.fillcolor = e.target.className.split(' ')[1];
    }
  }

  // UPDATING THE TOOL

  function onToolUpdate(e){
    current.tool = e.target.className.split(' ')[1];
  }

  // UPDATING THE BOARD COLORS

  function onBgcolorUpdate(e){
    current.bgcolor = e.target.className.split(' ')[1];
    current.canvas = document.getElementById('page'+previouspagecount);
    main_ctx = current.canvas.getContext('2d');
    current.canvas.style.backgroundColor = current.bgcolor;
    socket.emit('color', {color:current.bgcolor});
  }
  function onGraphUpdate(e){
    current.tool = "graph";
  }
  function size_update(e){
    thickness = sizer.value;
  }
var created = false;
    function onNewPageUpdate(emit){
    scanvas.style.display = 'block';
    var ncanvas = document.createElement('canvas');
    var context = ncanvas.getContext('2d');
    //counter.innerHTML =  currentpagecount + "\/" + totalpagecount ; //currentpagecount + 1;
    //document.getElementById('message').value = currentpagecount +"\/" + totalpagecount;
    //currentpagecount = currentpagecount + 1;
    totalpagecount = totalpagecount + 1;//counter.innerHTML;
    ncanvas.id = "page" + totalpagecount ; //counter.innerHTML;
    ncanvas.width = window.innerWidth;
    ncanvas.height = window.innerHeight;
    current.bgcolor = 'white';
    ncanvas.style.position= 'absolute';
    ncanvas.style.top = 0;
    ncanvas.style.left = 0;
    ncanvas.style.backgroundColor = current.bgcolor;
    ncanvas.style.zIndex = 0;
    if(scanvas.style.display = 'none'){}else if(scanvas.style.display = 'block'){scanvas.style.display = 'none';}
    if(current.canvas != canvas){
    current.canvas.style.display = 'none';
    }
    totalcurrentpagecount = totalcurrentpagecount + 1;
    previouspagecount = totalcurrentpagecount;
    document.body.appendChild(ncanvas);
    current.canvas = ncanvas;
    main_ctx = context;
    counter.innerHTML = totalcurrentpagecount + "\/" + totalpagecount ;
    if(!emit){return;}
    socket.emit('new_page', {color: current.bgcolor,api: api});
    //save();
}

    function move_left(emit){
   var currentpagecount = previouspagecount ;
        //alert(currentpagecount);
    if(currentpagecount == '1'){
      return;
    }else if(currentpagecount != '1'){
      //currentpagecount = totalcurrentpagecount ;
    var d_area = document.getElementById('page' + currentpagecount) ;
    d_area.style.display = 'none';
    currentpagecount = currentpagecount - 1 ;
    previouspagecount = currentpagecount ;
    nextpagecount = previouspagecount ;
    counter.innerHTML = currentpagecount + "\/" + totalpagecount ;
    var a_area = document.getElementById('page' + currentpagecount ) ;
    a_area.style.display = 'block';
    current.canvas = a_area;
    main_ctx = a_area.getContext('2d');
    if(!emit){return;}
    socket.emit('left',{api: api});
  }
    //save();
}
function move_right(emit){
     var currentpagecount = nextpagecount ;
    if(currentpagecount == totalpagecount ){
       return;
     }else if(currentpagecount !== totalpagecount){
      // currentpagecount = totalcurrentpagecount ;
    var d_area = document.getElementById('page' + currentpagecount ) ;
    d_area.style.display = 'none';
    currentpagecount = currentpagecount + 1;
    nextpagecount = currentpagecount ;
    previouspagecount = nextpagecount;
    counter.innerHTML = currentpagecount + "\/" + totalpagecount ;
    var a_area = document.getElementById('page' + currentpagecount) ;
    a_area.style.display = 'block';
    current.canvas = a_area;
    main_ctx = a_area.getContext('2d');
    if(!emit){return;}
    socket.emit('right',{api: api});
  }
    //save();
}
  function update_data(acontext, gcontext, canvasname){
     gcontext.drawImage(canvasname, 0, 0);
     acontext.clearRect(0, 0, scanvas.width, scanvas.height);
    drawing = false;
  }

  // LIMIT THE NUMBER OF EVENTS PER SECOND

  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onUpdateDataEvent(){
    if(current.canvas == canvas){
      update_data(context, scontext, canvas);
    }else if(current.canvas !== 'canvas'){
      update_data(context, main_ctx, canvas);
    }
  }
  function onDrawingEvent(data){
   if(data.api == api){
    var cw = canvas.width;
    var ch = canvas.height;
    draw.pen(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color);
   }else{
       return;
   }
  }
  function onEraserEvent(data){
  if(data.api == api){
    var cw = canvas.width;
    var ch = canvas.height;
    draw.eraser(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color);
  }else{return;}
  }
  function onRectEvent(data){
   if(data.api == api){
    var cw = scanvas.width;
    var ch = scanvas.height;
    draw.rect(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color, data.fill);
   }else{return;}
  }
  function onCircleEvent(data){
   if(data.api == api){
    var cw = scanvas.width;
    var ch = scanvas.height;
    draw.circle(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color, data.fill);
   }else{return;}
  }
  function onTriEvent(data){
   if(data.api == api){
    var cw = scanvas.width;
    var ch = scanvas.height;
    draw.triangle(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color, data.fill);
   }else{return;}
  }
  function onRtriEvent(data){
   if(data.api == api){
    var cw = scanvas.width;
    var ch = scanvas.height;
    draw.right_triangle(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color, data.fill);
    //draw.right_triangle(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color, data.fill);
   }else{return;}
  }
  function onTriEvent(data){
   if(data.api == api){
    var cw = scanvas.width;
    var ch = scanvas.height;
    draw.triangle(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color, data.fill);
    //draw.triangle(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color, data.fill);
   }else{return;}
  }
  function onLineEvent(data){
  if(data.api == api){
    var cw = scanvas.width;
    var ch = scanvas.height;
    draw.line(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color);
  }else{return;}
  }
  function onHlightEvent(data){
   if(data.api == api){
    var cw = scanvas.width;
    var ch = scanvas.height;
    draw.hlight(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch);
   }else{return;}
  }
  function onClearEvent(data){
   if(data.api == api){
    current.canvas = document.getElementById('page'+previouspagecount);
    main_ctx = current.canvas.getContext('2d');
    main_ctx.clearRect(0, 0, canvas.width, canvas.height);
   }else{return;}
  }
  function onLeftEvent(){
   if(data.api == api){
    move_left();
   }else{return;}
  }
  function onRightEvent(){
   if(data.api == api){
    move_right();
   }else{return;}
  }
  function onUndoEvent(data){
    history.undo(scanvas, scontext, true);
  }
  function onRedoEvent(data){
    history.redo(scanvas, scontext, true);
  }
  function onGraphEvent(data){
   if(data.api == api){
    var cw = scanvas.width;
    var ch = scanvas.height;
    draw.graph(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color,data.thickness);
   }else{return;}
  }
  function onNewPageEvent(data){
    if(data.api == api){
     onNewPageUpdate();
    }else{return;}
  }
  function onControlsEvent(data){
      post = 'T';
      var user = find('user');
      var post = find('post');
      user = user.replace('%20', ' ');
      if(data.api == api){
      if(data.user == user+'('+post+')'){
      document.getElementById('tls_desk').style.display = 'block';
      }else{return;}
      }else{return;}
  }
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scanvas.width = window.innerWidth;
    scanvas.height  = window.innerHeight;
    current.tool = "Pen";
    }
    undo.addEventListener('click', function() {
     history.undo(canvas, context, true);
   });

   redo.addEventListener('click', function() {
    history.redo(canvas, context, true);
  });
// IMAGE UPLOADING SECTION. IT'S TOTALLY DIFFERENT SECTION DO NOT COMBINE IT WITH ANY OTHER FUNCTION 💀 ☠ 👿 😈.
    var element = null;
function setMousePosition(e) {
    var ev = e || window.event; //Moz || IE
    if (ev.pageX) { //Moz
        mouse.x = ev.pageX + window.pageXOffset;
        mouse.y = ev.pageY + window.pageYOffset;
    } else if (ev.clientX) { //IE
        mouse.x = ev.clientX + document.body.scrollLeft;
        mouse.y = ev.clientY + document.body.scrollTop;
    }
}
var mouse = {
    x: 0,
    y: 0,
    startX: 0,
    startY: 0
};
function add_move(x0, y0, x1, y1, color, fill, emit){
  if (element !== null) {
      element.style.width = Math.abs(x1 - x0) + 'px';
      element.style.height = Math.abs(y1 - y0), + 'px';
      element.style.left = Math.min(x0,x1) + 'px';
      element.style.top = Math.min(y0,y1) + 'px';
  }
  mouse.startX = current.x;
  mouse.startY = current.y;
  element = document.createElement('div');
  element.style.backgroundImage ="url('http://hyperphysics.phy-astr.gsu.edu/hbase/geoopt/imggo/cvex1.gif')";
  element.style.backgroundRepeat = 'no-repeat';
  element.className = 'rectangle resize-drag'
  element.style.left = current.x + 'px';
  element.style.top = current.y + 'px';
  element.style.zIndex = 1000;
  document.body.appendChild(element);
  canvas.style.cursor = "crosshair";
  if (element !== null) {
       element = null;
       canvas.style.cursor = "default";
       console.log("finsihed.");
       current.tool = 'Pen';
}
}

//alert('It is successfull.<br />Lorem ipsum cum sociss bonjur annayang siri cortana life like moto apple bannana.Lorem ipsum cum sociss bonjur annayang siri cortana life like moto apple bannana.Lorem ipsum cum sociss bonjur annayang siri cortana life like moto apple bannana', 'success');

})();
