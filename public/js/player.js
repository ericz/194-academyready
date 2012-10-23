function AcademyReadyPlayer () {

  this.buckets = [];
  
  this.items = []
  
  this.resize();
  

}

AcademyReadyPlayer.prototype.resize = function() {
  var h = $(window).height();
  var w = $(window).width();
  var l = w * split;
 
  lrheight = h - BOTTOM_HEIGHT;
  
  left.width(l);
  left.height(lrheight);
  
  rwidth = w - l;
  right.width(rwidth);
  right.height(lrheight);
  
  var ytheight, ytwidth;
  
  var rwidthpad = rwidth - RIGHT_PANEL_PADDING;
  var lrheightpad = lrheight - RIGHT_PANEL_PADDING;
  
  if (rwidthpad / lrheightpad > YTASPECT) {
    ytheight = lrheightpad;
    ytwidth = ytheight * YTASPECT;
  } else {
    ytwidth = rwidthpad;
    ytheight = ytwidth / YTASPECT;    
  }
  var ytleft = (rwidth - ytwidth) / 2;
  var yttop = (lrheight - ytheight) / 2;
  $('#yt').css({
    width: ytwidth,
    height: ytheight,
    left: ytleft,
    top: yttop
  });
  
  this.rebucket(Math.floor(w / PANEL_WIDTH));
  this.refreshProgress();
};

AcademyReadyPlayer.prototype.addItem = function(item) {
  this.items.push(item);
  var bucketSize = yt.getDuration() / this.buckets.length;
  var bucketIndex = Math.floor(item.time / bucketSize);
  var q = $('<div></div>').addClass('b-panel-q').data('item', item).text(item.title).click(this.setItem);
  this.buckets[bucketIndex].append(q);
};

AcademyReadyPlayer.prototype.setItem = function() {
  $('.b-panel-q-selected').removeClass('b-panel-q-selected');
  $(this).addClass('b-panel-q-selected');
  var leftContent = $('#l-content');
  leftContent[0].innerHTML = '';
  var item = $(this).data('item');
  var head = $('<h1></h1>').text(item.title);
  var body = $('<div></div>').addClass('l-body').text(item.body);
  leftContent.append([head, body]);
}

AcademyReadyPlayer.prototype.rebucket = function(count) {
  bottom[0].innerHTML = '';
  this.buckets = [];
  
  var bucketSize = yt.getDuration() / count;
  
  for (var i = 0; i < count; i++) {
    var bucket = $('<div></div>').addClass('b-panel').appendTo(bottom);
    this.buckets.push(bucket);
  }
  for (var i = 0, ii = this.items.length; i < ii; i++) {
    var item = this.items[i];
    var bucketIndex = Math.floor(item.time / bucketSize);
    var q = $('<div></div>').addClass('b-panel-q').data('item', item).text(item.title).click(this.setItem);
    this.buckets[bucketIndex].append(q);
  }
  
};

AcademyReadyPlayer.prototype.refreshProgress = function(){
    
  var currentTime = yt.getCurrentTime();
  var duration = yt.getDuration();

  var percentProgress = (currentTime / duration) * 100;
  progressMeter.css('right', (99.5 - percentProgress) + '%');
  
  var bucketIndex = Math.floor(percentProgress * this.buckets.length / 100);
  $('.b-panel-selected').removeClass('b-panel-selected');
  if (bucketIndex < this.buckets.length) {
    this.buckets[bucketIndex].addClass('b-panel-selected');
  }
};