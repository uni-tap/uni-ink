var socket = io();
var filters = {
    profanity : function(dat){
         return true
    },
    markup : function(){
        
    },
    emoji : function(){
        
    },
    blocked_usr : function (){
        
    },
    from_blocked : function(usr){
        console.log('filtering');
        for (var i = 0; i < blocked.length; i++) {
        if(usr == blocked[i]){
            window.reload();
        }
        }
    },
    links : function(){
        return true
    }
}
var emomsgs = [];
var msg = document.getElementById("msg");
var send = document.getElementById("send");
var msg_lst = document.getElementById('chats');
    send.addEventListener('click', function(){
        send_msg();
    },false);
socket.on('chat_msg', function(data) {
    if (data.api == find('api')) {
      if (data.user != find('user')) {
          recieve_msg(data.chat, data.type, data.user);
      }else{return;}
    }else{return;}
});
function send_msg(type){
    var li = document.createElement('li');
    if(!type || type == 'norm'){
        if(msg.value == ''){return;}
        li.className = 's_msg';
        li.style.backgroundColor = document.getElementById('cht_clr').innerHTML;
        li.innerHTML = msg.value;
    }else if(type == 'img'){
        li.className = 's_msg s_img';
        li.style.backgroundColor = document.getElementById('cht_clr').innerHTML;
        var img_box = document.createElement('img');
            img_box.src = "http://uni-tap.co/nusr/dp.php?id=58";
            li.appendChild(img_box);  
        //li.innerHTML = msg.value;
    }else if(type == 'emoji'){
        li.className = 's_msg s_emoji';
        li.style.backgroundColor = document.getElementById('cht_clr').innerHTML;
        var img_box = document.createElement('img');
            img_box.src = "https://static.xx.fbcdn.net/images/emoji.php/v9/z88/1/32/1f600.png";
            li.appendChild(img_box);
    }else if(type == 'link'){
        li.className = 's_msg s_link';
        li.style.backgroundColor = document.getElementById('cht_clr').innerHTML;
        var prev = document.createElement('iframe');
            prev.src = "/security.html";
            li.appendChild(prev);
    }else if(type == 'animoji'){
        li.className = 's_msg s_aemoji';
        li.setAttribute('emo_cont', msg.value);
        li.style.backgroundColor = document.getElementById('cht_clr').innerHTML;
        animate();  
    }
    var info_div = document.createElement('div');
        info_div.className = 'usr_info';
    var usr_img = document.createElement('img');
        usr_img.src = "http://uni-tap.co/nusr/dp.php?id=1";
        info_div.appendChild(usr_img);
    var info = document.createElement('span');
        info.innerHTML += 'You';
        info_div.appendChild(info);
        li.appendChild(info_div);
    msg_lst.appendChild(li);
    emojify.run();
// OR
emojify.run(document.getElementById('msg'));
// OR
emojify.run(null, function(emoji, emojiName){
  var span = document.createElement('span');
  span.className = 'emoji emoji-'  + emojiName;
  span.innerHTML = emoji + ' replaced';
  return span;
});
    li.focus();
    toggle('.placeholder');
    socket.emit('chat_msg', {
      chat: msg.value,
      user: 'divg',//localStorage.user,
      id: find('id'),
      type: type,  
      api: find('api')
    });
    msg.value = '';
}
function recieve_msg(r_msg, type, from){
    var validate = filters.from_blocked(from);
    validate;
    var li = document.createElement('li');
    if(!type || type == 'norm'){
        li.className = 'r_msg';
        li.innerHTML = r_msg;
    }else if(type == 'img'){
        li.className = 'r_msg s_img';
        var img_box = document.createElement('img');
            img_box.src = "http://uni-tap.co/nusr/dp.php?id=58";
            li.appendChild(img_box);  
        //li.innerHTML = msg.value;
    }else if(type == 'emoji'){
        li.className = 's_msg s_emoji';
        var img_box = document.createElement('img');
            img_box.src = "https://static.xx.fbcdn.net/images/emoji.php/v9/z88/1/32/1f600.png";
            li.appendChild(img_box);
    }else if(type == 'link'){
        li.className = 's_msg s_link';
        var prev = document.createElement('iframe');
            prev.src = "/security.html";
            li.appendChild(prev);
    }
    var info_div = document.createElement('div');
        info_div.className = 'usr_info';  
    var usr_img = document.createElement('img');
        usr_img.src = "http://uni-tap.co/nusr/dp.php?id=1";
        usr_img.addEventListener('click', function(){options(usr_img, from)},false);
        info_div.appendChild(usr_img);
    var info = document.createElement('span');
        info.innerHTML += from;
        info_div.appendChild(info);
        li.appendChild(info_div);
        li.setAttribute('data-usr', from);
    msg_lst.appendChild(li);
    emojify.run();
// OR
emojify.run(document.getElementById('msg'));
// OR
emojify.run(null, function(emoji, emojiName){
  var span = document.createElement('span');
  span.className = 'emoji emoji-'  + emojiName;
  span.innerHTML = emoji + ' replaced';
  return span;
});
}   
    function animate(){  
        var emsgs = document.getElementsByClassName('s_aemoji');
        var s = msg.value;
    for(i = 0; i < emsgs.length; i++){   
        var emo = msg.value;
        if(emo == 'undefined'){emo = "";}
      setInterval(function(){
  emsgs[i].innerHTML = [
    ...emo
  ][~~(Math.random()*6)]
},500);
      console.log('running');
    }
    }
