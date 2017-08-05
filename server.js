const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

// ARRAYS

users = [];
connections = [];
// DIRECTORY THAT WILL BE SERVED BY THE SERVER TO THE CLIENT

app.use(express.static(__dirname + '/public'));

// IF A NEW USER IS CONNECTED

io.on('connection', function(socket){
  connections.push(socket);/*
  socket.on('room', function(room) {
   socket.join(room);
   var room = room;)};*/
  console.log("connected: %s sockets connected", connections.length);
  //socket.on('drawing',(room ,data) => socket.broadcast.to(room).emit('drawing', data));
  socket.on('drawing',(data) => socket.broadcast.emit('drawing', data));
  socket.on('esr',(data) => socket.broadcast.emit('esr', data));
  socket.on('rect',  (data) => socket.broadcast.emit('rect', data));
  socket.on('circle',(data) => socket.broadcast.emit('circle', data));
  socket.on('line', (data) => socket.broadcast.emit('line', data));
  socket.on('tri',  (data) => socket.broadcast.emit('tri', data));
  socket.on('rtri', (data) => socket.broadcast.emit('rtri', data));
  socket.on('clear',(data) => socket.broadcast.emit('clear', data));
  socket.on('create', function(room) {socket.join(room);});
  socket.on('end_class', function(data){io.emit('end_class', data)});
  socket.on('update_data', (data)  => socket.broadcast.emit('update_data', data));
  socket.on('undo', (data)  => socket.broadcast.emit('undo', data));
  socket.on('redo', (data)  => socket.broadcast.emit('redo', data));
  socket.on('graph', (data)  => socket.broadcast.emit('graph', data));
  socket.on('new_page', (data)  => socket.broadcast.emit('new_page', data));
  socket.on('left', (data)  => socket.broadcast.emit('left', data));
  socket.on('right', (data)  => socket.broadcast.emit('right', data));
  socket.on('reload', (data)  => socket.broadcast.emit('rieload', data));
  socket.on('color', (data)  => socket.broadcast.emit('color', data));
  socket.on('hlight',(data) => socket.broadcast.emit('hlight', data));    
  socket.on('all_data', (data)  => socket.broadcast.emit('all_data', data));
// IF A USER GETS DISCONNECTED

socket.on('disconnect', function(socket){
  users.splice(users.indexOf(socket.username),1);
  updateUsernames();
  connections.splice(connections.indexOf(socket), 1);
  console.log('Disconnected: %s sockets connected', connections.length);
  });

//============================
// CHAT SECTION
//============================

   socket.on('send message', function(data){
   io.sockets.emit('new message', {msg: data, user: socket.username});
   });

 //NEW USER

   socket.on('new_user', function(data, callback){
       callback(true);
       socket.username = data;
       users.push(socket.username);
       updateUsernames();
   });

// UPDATING THE USERS LIST

function updateUsernames(){
  io.sockets.emit('get users', users);
}
});

// MAKING THE SERVER LISTEN ON THE PORT

http.listen(port, () => console.log((new Date()) +' => SERVER LISTENING ON PORT => ' + port));
