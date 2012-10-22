var yt;

function onYouTubePlayerReady(playerId) {
  yt = document.getElementById(playerId);
  init();
}

var params = { allowScriptAccess: "always" };
var atts = { id: "yt" };
swfobject.embedSWF("http://www.youtube.com/v/wZDv9pgHp8Q?autohide=1&rel=0&enablejsapi=1&modestbranding=1&playerapiid="+atts.id+"&version=3", "ytapiplayer", "480", "270", "8", null, null, params, atts);

