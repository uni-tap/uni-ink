'use strict';

(function() {
  var thickness = 2;
  var socket = io();
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var scanvas = document.getElementsByClassName('storeboard')[0];
  var colors = document.getElementsByClassName('color');
  var bgcolors = document.getElementsByClassName('bgcolor');
  var tools  = document.getElementsByClassName('tlsbtn');
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
  var counter = document.getElementById("counter");

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

  var drawing = false;

  //ADDING EVENT LISTENERS TO THE CANVAS

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, true);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
  canvas.addEventListener('pointerdown', onMouseDown, false);
  canvas.addEventListener('pointerup', onMouseUp, false);
  canvas.addEventListener('pointermove', throttle(onMouseMove, 10), false);
  canvas.addEventListener('touchstart', onMouseDown, false);
  canvas.addEventListener('touchend', onMouseUp, false);
  canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);
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
  socket.on('color', function(data){
    current.canvas = document.getElementById('page'+counter.innerHTML);
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
          color: color
        });
      },
      eraser: function(x0, y0, x1, y1, color, emit){
        main_ctx.beginPath();
        main_ctx.lineCap="round";
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
          color: color
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
         fill: fill
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
         fill: fill
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
         color: color
       });
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
         fill: fill
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
         color: color
       });
   },
     'Text':function(x0, y0, x1, y1, color, emit){
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
    }
  };
  function ClearCanvas(){
      current.canvas = document.getElementById('page'+counter.innerHTML);
      main_ctx = current.canvas.getContext('2d');
      main_ctx.clearRect(0, 0, canvas.width, canvas.height);
      socket.emit('clear');
  }

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
  }

  function onMouseMove(e){
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
    if (current.tool == 'img'){ // IF TRIANGLE BUTTON IS CLICKED
        add_move(current.x, current.y, e.clientX, e.clientY, current.color, current.fillcolor, true);
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
      current.canvas = document.getElementById('page'+counter.innerHTML);
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
    current.canvas = document.getElementById('page'+counter.innerHTML);
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
function onNewPageUpdate(mcurrentcount){
    scanvas.style.display = 'block';
    var ncanvas = document.createElement('canvas');
    var ncontext = ncanvas.getContext('2d');
    counter.innerHTML = currentcount +1;
    currentcount = currentcount + 1;
    ncanvas.id = "page" + counter.innerHTML;
    ncanvas.width = window.innerWidth;
    ncanvas.height = window.innerHeight;
    current.bgcolor = 'white';
    ncanvas.style.position= 'absolute';
    ncanvas.style.top = 0;
    ncanvas.style.left = 0;
    ncanvas.style.backgroundColor = current.bgcolor;
    ncanvas.style.zIndex = 0;
    if(scanvas.style.display = 'none'){}else if(scanvas.style.display = 'block'){scanvas.style.display = 'none';}
    document.body.appendChild(ncanvas);
    current.canvas = ncanvas;
    main_ctx = ncontext;
    socket.emit('new_page', {color: current.bgcolor});
}
function move_left(){
    if(counter.innerHTML == '1'){alert('No More Pages');return;}else{
    var d_area = document.getElementById('page' + counter.innerHTML);
    d_area.style.display = 'none';
    counter.innerHTML = counter.innerHTML - 1;
    var a_area = document.getElementById('page' + counter.innerHTML);
    a_area.style.display = 'block';
    current.canvas = a_area;
    main_ctx = a_area.getContext('2d');
    count = count - 1;
    socket.emit('left');
    }
}
function move_right(){
    //if(counter.innerHTML = count){alert('No More Pages');return;}else{
    var a_area = document.getElementById('page' + counter.innerHTML);
    a_area.style.display = 'none';
    counter.innerHTML = count + 1;
    count = count + 1;
    var d_area = document.getElementById('page' + count);
    d_area.style.display = 'block';
    current.canvas = d_area;
    main_ctx = d_area.getContext('2d');
    socket.emit('right');
  //}
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
    var cw = canvas.width;
    var ch = canvas.height;
    draw.pen(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color);
  }
  function onEraserEvent(data){
    var cw = canvas.width;
    var ch = canvas.height;
    draw.eraser(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color);
  }
  function onRectEvent(data){
    var cw = scanvas.width;
    var ch = scanvas.height;
    draw.rect(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color, data.fill);
  }
  function onCircleEvent(data){
    var cw = scanvas.width;
    var ch = scanvas.height;
    draw.circle(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color, data.fill);
  }
  function onTriEvent(data){
    var cw = scanvas.width;
    var ch = scanvas.height;
    draw.triangle(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color, data.fill);
  }
  function onRtriEvent(data){
    var cw = scanvas.width;
    var ch = scanvas.height;
    draw.right_triangle(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color, data.fill);
    draw.right_triangle(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color, data.fill);
  }
  function onLineEvent(data){
    var cw = scanvas.width;
    var ch = scanvas.height;
    draw.line(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color);
  }
  function onClearEvent(data){
    current.canvas = document.getElementById('page'+counter.innerHTML);
    main_ctx = current.canvas.getContext('2d');
    main_ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  function onLeftEvent(){
    var d_area = document.getElementById('page' + counter.innerHTML);
    d_area.style.display = 'none';
    counter.innerHTML = counter.innerHTML - 1;
    var a_area = document.getElementById('page' + counter.innerHTML);
    a_area.style.display = 'block';
    current.canvas = a_area;
    main_ctx = a_area.getContext('2d');
    count = count - 1;
  }
  function onRightEvent(){
    var a_area = document.getElementById('page' + counter.innerHTML);
    a_area.style.display = 'none';
    counter.innerHTML = count + 1;
    count = count + 1;
    var d_area = document.getElementById('page' + count);
    d_area.style.display = 'block';
    current.canvas = d_area;
    main_ctx = d_area.getContext('2d');
  }
  function onUndoEvent(data){
    history.undo(scanvas, scontext, true);
  }
  function onRedoEvent(data){
    history.redo(scanvas, scontext, true);
  }
  function onGraphEvent(data){
    var cw = scanvas.width;
    var ch = scanvas.height;
    draw.graph(data.x0 * cw, data.y0 * ch, data.x1 * cw, data.y1 * ch, data.color,data.thickness);
  }
  function onNewPageEvent(data){
    scanvas.style.display = 'block';
    var ncanvas = document.createElement('canvas');
    var ncontext = ncanvas.getContext('2d');
    counter.innerHTML = currentcount +1;
    currentcount = currentcount + 1;
    ncanvas.id = "page" + counter.innerHTML;
    ncanvas.width = window.innerWidth;
    ncanvas.height = window.innerHeight;
    ncanvas.style.position= 'absolute';
    ncanvas.style.top = 0;
    ncanvas.style.left = 0;
    ncanvas.style.backgroundColor = data.color;
    ncanvas.style.zIndex = 0;
    if(scanvas.style.display = 'none'){}else if(scanvas.style.display = 'block'){scanvas.style.display = 'none';}
    document.body.appendChild(ncanvas);
    current.canvas = ncanvas;
    main_ctx = ncontext;
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
}/*
function addImage(emit){
var counter = document.getElementById('counter');
initDraw(canvas);

function initDraw(mcanvas) {
    function setMousePosition(e) {
        var ev = e || window.event; //Moz || IE
        if (ev.pageX) { //Moz
            mouse.x = ev.pageX + window.pageXOffset;
            mouse.y = ev.pageY + window.pageYOffset;
        } else if (ev.clientX) { //IE
            mouse.x = ev.clientX + document.body.scrollLeft;
            mouse.y = ev.clientY + document.body.scrollTop;
        }
    };

    var mouse = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };
    var element = null;
    var dcanvas = canvas;
      console.log("begun.");
      mouse.startX = mouse.x;
      mouse.startY = mouse.y;
      element = document.createElement('div');
      element.style.backgroundImage ="url('http://hyperphysics.phy-astr.gsu.edu/hbase/geoopt/imggo/cvex1.gif')";
      element.style.backgroundRepeat = 'no-repeat';
      element.className = 'rectangle resize-drag'
      element.style.left = mouse.x + 'px';
      element.style.top = mouse.y + 'px';
      element.style.zIndex = 1000;
      document.body.appendChild(element);
      dcanvas.style.cursor = "crosshair";
    }
    dcanvas.onmousemove = function (e) {
        setMousePosition(e);
        if (element !== null) {
            element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
            element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
            element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
            element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
        }
    }

       dcanvas.onmouseup = function(e) {
       if (element !== null) {
            element = null;
            dcanvas.style.cursor = "default";
            console.log("finsihed.");
            current.tool = 'Pen';
     }
   }
 }
if(!emit){return}
 var cw  = canvas.width;
 var ch = canvas.height;

 socket.emit('image',{
   x: mouse.x,
   y: mouse.y,
   startX: mouse.startX,
   startY: mouse.startY,
   src: ''
 });
}*/
})();
