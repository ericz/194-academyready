var YTASPECT = 16/9;
var BOTTOM_HEIGHT = 165;
var PANEL_WIDTH = 200;
var RIGHT_PANEL_PADDING = 80;

var left, right, bottom, progressMeter, timeDisplay, time;
var split = .35;


var VIDEO_ID = '5';

var player;




function init(){
  $(function(){
    left = $('#left');
    right = $('#right');
    bottom = $('#bottom');
    progressMeter = $('#progress-meter');
    time = $('#add-time');
    timeDisplay = $('#add-time-display');
    player = new AcademyReadyPlayer();
    
    $(window).resize(player.resize.bind(player));
    
    
    setInterval(player.refreshProgress.bind(player), 200);
    
    // Load questions
    loadQuestions();
    
  });
  
  var socket = io.connect('/');
  socket.on('addedComment', function (data) {
    var q = $('#'+data.questionId);
    var item = q.data('item');
    item.comments.push({body:data.commentText});
    if(q.hasClass('b-panel-q-selected')) {
      var comment = $('<div></div>').addClass('l-comment').text(data.commentText);
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
      userName: 'Anonymous'
    };
    player.addItem(item);
  });

  
}




// Testing

function loadQuestions() {
  $.getJSON('/getQuestionsByVideoId/' + VIDEO_ID, function(res){
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
        userName: 'Eric Z.'
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
      userName: 'Eric Z.'
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