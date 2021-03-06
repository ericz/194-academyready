function AcademyReadyPlayer () {
  this.buckets = [];
  
  this.items = []
  
  this.resize();
  
  $('#add').click(function(){
    $(this).hide();
    $('#cancel').css('display', 'inline-block');
    $('#l-add').show();
    $('#l-content').hide();
  });
  
  $('#cancel').click(function(){
    $(this).hide();
    $('#add').css('display', 'inline-block');
    $('#l-add').hide();
    $('#l-content').show();
    $('#add-title').val('');
    $('#add-question').val('');
  });
  
  $('#add-submit').click(function(){
    $.post('/addQuestion', {
      questionTitle: $('#add-title').val(),
      questionText: $('#add-question').val(),
      videoId: VIDEO_ID,
      videoTime: parseInt(time.val())
    });
    $('#cancel').click();
  });
}

AcademyReadyPlayer.prototype.resize = function() {
  var h = $(window).height();
  var w = $(window).width();
  var l = w * split;
 
  lrheight = h - BOTTOM_HEIGHT - BAR_HEIGHT;
  
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
  var darktime = $('<span></span>').addClass('darktime').text(item.userName + ' ' + formatTime(item.time));
  var q = $('<div></div>').addClass('b-panel-q').data('item', item).prop('id', item.id).text(item.title).append(darktime).click(this.setItem);
  var bucket = this.buckets[bucketIndex]; 
  bucket.append(q);
  bucket.children('.b-panel-label').remove();
  var label = $('<div></div>', {class: 'b-panel-label'});
  var timelabel = formatTime(bucketSize*bucketIndex) + '-' + formatTime(bucketSize*(bucketIndex+1));
  label.text(timelabel);
  label.prependTo(bucket);
};
AcademyReadyPlayer.prototype.removeItem = function(id) {
  for(var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    if(item.id == id) {
      this.items.splice(i,1);
      $('#' + id).remove();
    }
  }
};

AcademyReadyPlayer.prototype.setItem = function() {
  $('#cancel').click();
  $('.b-panel-q-selected').removeClass('b-panel-q-selected');
  $(this).addClass('b-panel-q-selected');
  var leftContent = $('#l-content');
  leftContent[0].innerHTML = '';
  var item = $(this).data('item');
  var head = $('<h1></h1>').text(item.title);
  var details = $('<div></div>').addClass('l-details');
  var time = $('<a></a>', {href: '#'}).addClass('l-time').text(formatTime(item.time) + ' / ' + formatTime(yt.getDuration()) + ' ').click(function(){
    yt.seekTo(item.time);
  });;
  var author = $('<span></span>').addClass('l-created').text('Created by ' + item.userName + ' ');
  var date = $('<span></span>').addClass('l-created').text($.timeago(item.created));
  details.append([time, author, date]);
  var body = $('<div></div>').addClass('l-body').text(item.body);
  
  var comments = $('<div></div>').addClass('l-comments-wrap');
 
  var input = $('<textarea></textarea>').prop('id', 'add-comment').addClass('text-input').prop('rows', 2).prop('placeholder', 'Add to the discussion').keyup(function(){
    if($(this).val().length > 0) {
      $('#submit-comment').css('display', 'inline-block');
    } else {
      $('#submit-comment').hide();
    }
  });
  var submit = $('<div></div>').addClass('btn').prop('id', 'submit-comment').text('Add comment').click(function(){
    $.post('/addComment', {
      questionId: item.id,
      commentText: $('#add-comment').val(),
      videoId: VIDEO_ID
    });
    $('#add-comment').val('');
    $(this).hide();
  });
  var submitwrap = $('<div></div>').prop('align', 'right').append(submit);
  function setComments (){
    var commenthead = $('<div></div>').addClass('l-commenthead').text(item.comments.length + ' comments');
    comments.append(commenthead);
    for (var i = 0; i < item.comments.length; i++) {
      var meta = $('<div></div>', {class: 'l-comment-meta'}).text(item.comments[i].userName);
      var comment = $('<div></div>').addClass('l-comment').text(item.comments[i].body).append(meta);
      comments.append(comment);
    }
  }
 
  if (item.comments) {
    setComments();
  } else {
    item.comments = [];
    $.getJSON('/question/' + item.id + '/comments', function(res) {
      for(var i = 0; i < res.data.length; i++) {
        var d = res.data[i];
        var comment = {
          body: d.commentText,
          userName: d.user
        };
        item.comments.push(comment);
      }
      setComments();
    });
  }
  
  leftContent.append([head, details, body, comments, input, submitwrap]);
  if(item.userName == USER) {
    var del = $('<a></a>', {href: "#", class: 'l-del'}).text('Delete this discussion').click(function(){
      $.post('/deleteQuestion', {id: item.id, videoId: VIDEO_ID}, function(){
        $('#cancel').click();
      });
    });
    details.before(del);
  }
};

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
    var darktime = $('<span></span>').addClass('darktime').text(item.userName + ' ' + formatTime(item.time));
    var q = $('<div></div>').addClass('b-panel-q').data('item', item).text(item.title).append(darktime).click(this.setItem);
    this.buckets[bucketIndex].append(q);
  }
  $('.b-panel').each(function(bucketIndex){
    var bucket = $(this);
    var label = $('<div></div>', {class: 'b-panel-label'});
    var timelabel = formatTime(bucketSize*bucketIndex) + '-' + formatTime(bucketSize*(bucketIndex+1));
    label.text(timelabel);
    label.prependTo(bucket);
  });
};



AcademyReadyPlayer.prototype.refreshProgress = function(){
    
  var currentTime = yt.getCurrentTime();
  var duration = yt.getDuration();

  var percentProgress = (currentTime / duration) * 100;
  //progressMeter.css('right', (99.5 - percentProgress) + '%');
  
  var bucketIndex = Math.floor(percentProgress * this.buckets.length / 100);
  $('.b-panel-selected').removeClass('b-panel-selected');
  if (bucketIndex < this.buckets.length) {
    this.buckets[bucketIndex].addClass('b-panel-selected');
  }
  
  timeDisplay.text(formatTime(currentTime));
  time.val(currentTime);
};

function formatTime(currentTime) {
  var seconds = Math.floor(currentTime % 60);
  var minutes = Math.floor(currentTime / 60).toString();
  
  return minutes + ':' + pad2(seconds);
}

function pad2(number) {
  return (number < 10 ? '0' : '') + number
}

