var YTASPECT = 16/9;
var BOTTOM_HEIGHT = 198;
var PANEL_WIDTH = 200;
var RIGHT_PANEL_PADDING = 80;
var BAR_HEIGHT = 40;

var left, right, bottom, /*progressMeter,*/ timeDisplay, time;
var split = .35;

var player;


function loggedIn(user) {
  $('#re, #le').hide();
  USER = user;
  $('#login, #modal').hide();
  $('#username').text(user);
  $('#logoutlink').show();
  $('#loginlink').hide();
  $('#login input').val('');
}

function logout() {
  USER = undefined;
  $.getJSON('/logout');
  $('#login, #modal').show();
  $('#username').text('');
  $('#logoutlink').hide();
  $('#loginlink').show();
}

function init(){
  if (!(yt.getDuration() > 0)) {
    setTimeout(init, 200);
    return;
  }
  
  $(function(){
  
    if(!window.USER) {
      $('#login, #modal').show();
    } else {
      loggedIn(USER);
    }
 
    left = $('#left');
    right = $('#right');
    bottom = $('#bottom');
    //progressMeter = $('#progress-meter');
    time = $('#add-time');
    timeDisplay = $('#add-time-display');
    player = new AcademyReadyPlayer();
    
    $(window).resize(player.resize.bind(player));
    
    setInterval(player.refreshProgress.bind(player), 200);
    
    // Load questions
    loadQuestions();
    
    
    $('#loginlink, #logoutlink').click(logout);
    
    $('#registerbtn').click(function(){
      $.post('/register', {user: $('#u').val(), pass: $('#p').val()}, function(data){
        if(data.error){
          $('#re').text('The username and password combination is not valid or the username is already taken. Please use only letters, numbers, underscores and dashes in your username').show();
        } else {
          loggedIn(data.success);
        }
      });
    });
    
    $('#u, #p').keypress(function(e){
      if(e.keyCode == 13){
        $('#registerbtn').click();
      }
    });

    $('#loginbtn').click(function(){
      $.post('/login', {user: $('#user').val(), pass: $('#pass').val()}, function(data){
        if(data.error){
          $('#le').text('No account found with given username and password').show();
        } else {
          loggedIn(data.success);
        }
      });
    });
    
    $('#user, #pass').keypress(function(e){
      if(e.keyCode == 13){
        $('#loginbtn').click();
      }
    });
    
  });
  
  var socket = io.connect('/');
  socket.emit('change_video', {videoId: VIDEO_ID});
  socket.on('addedComment', function (data) {
    var q = $('#'+data.questionId);
    var item = q.data('item');
    item.comments.push({body:data.commentText});
    if(q.hasClass('b-panel-q-selected')) {
      var meta = $('<div></div>', {class: 'l-comment-meta'}).text(data.user);
      var comment = $('<div></div>').addClass('l-comment').text(data.commentText).append(meta);
      $('.l-comments-wrap').append(comment);
    }
  });
  socket.on('addedQuestion', function (data) {
    var item = {
      id: data._id,
      title: data.questionTitle,
      body: data.questionText,
      time: data.videoTime,
      created: data.date,
      userName: data.user || 'Anonymous'
    };
    player.addItem(item);
  });
  socket.on('deletedQuestion', function(data){
    player.removeItem(data);
  });
  
}




// Testing

function loadQuestions() {
  $.getJSON('/video/' + VIDEO_ID + '/questions', function(res){
    var qs = res.data;
    for(var i = 0; i < qs.length; i++) {
      var q = qs[i];
      q.questionTitle;
      var item = {
        id: q._id,
        title: q.questionTitle,
        body: q.questionText,
        time: q.videoTime,
        created: q.date,
        userName: q.user || 'Anonymous'
      };
      player.addItem(item);
    }
  });
}

function randomData(items) {
  var duration = yt.getDuration();
  for(var i = 0; i < items; i++) {
    var item = {
      id: randomString(30),
      title: randomString(30),
      body: randomString(200),
      time: Math.random() * duration,
      created: ((new Date()).getTime() - Math.round(Math.random() * 100000000)),
      userName: 'Anonymous'
    };
    player.addItem(item);
  }
}


function randomString(len, charSet) {
    charSet = charSet || 'ABCDEF GHIJKL MNOPQR STUVWX YZabcd efghijklmno pqrstuv wxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}