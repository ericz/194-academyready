var YTASPECT = 16/9;
var BOTTOM_HEIGHT = 165;
var PANEL_WIDTH = 200;
var RIGHT_PANEL_PADDING = 80;

var left, right, bottom, progressMeter;
var split = .35;


var player;

function init(){
  $(function(){
    left = $('#left');
    right = $('#right');
    bottom = $('#bottom');
    progressMeter = $('#progress-meter');
    player = new AcademyReadyPlayer();
    
    $(window).resize(player.resize.bind(player));
    
    
    setInterval(player.refreshProgress.bind(player), 200);
    
  });
}




// Testing

function randomData(items) {
  var duration = yt.getDuration();
  for(var i = 0; i < items; i++) {
    var item = {
      title: randomString(30),
      body: randomString(200),
      time: Math.random() * duration
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