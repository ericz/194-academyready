var yt;

function onYouTubePlayerReady(playerId) {
  yt = document.getElementById(playerId);
}

var params = { allowScriptAccess: "always" };
var atts = { id: "yt" };
swfobject.embedSWF("http://www.youtube.com/v/WnYuO0bGSTc?enablejsapi=1&playerapiid="+atts.id+"&version=3", "ytapiplayer", "425", "356", "8", null, null, params, atts);

