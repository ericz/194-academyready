var express = require('express');
var app = express();
var mongo = require('mongoskin');
var ObjectID = require('mongoskin').ObjectID;
var db = mongo.db('localhost:27017/194?auto_reconnect', {safe: true});
var Questions = db.collection('Questions');
var Comments = db.collection('Comments');
var Users = db.collection('Users');
var http = require('http');
var server = http.createServer(app);
var sio = require('socket.io');
var io = sio.listen(server);


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
app.use(express.cookieParser());

app.use(express.session({ secret: 'tiger', maxAge : new Date(Date.now() + 2628000000)}));

io.sockets.on('connection', function(socket){
	//console.log('connected');
	socket.emit('connected');
	socket.on('change_video', function(data){
		if (data.currentVideo){
			socket.leave(data.currentVideo)
		}
		socket.join(data.videoId);
	});
});

io.set('log level', 1);


var loggedIn = function(req, res, next) {
  if(req.session.user) {
    next();
  } else {
    res.send(401);
  }
};

app.get('/logout', function(req, res){
  delete req.session.user;
  res.send('ok');
});

app.post('/register', function(req, res){
  if (!req.body.user.match(/^[a-z0-9_-]+$/i) || req.body.pass.length < 2) {
    res.send({error: "bad"});
    return;
  }
  Users.insert({user: req.body.user, pass: req.body.pass}, function(err, doc){
    if(err || !doc) {
      res.send({error: "fail"});
      return;
    }
    req.session.user = doc[0].user;
    res.send({success: doc[0].user});
  });
});

app.post('/login', function(req, res){
  Users.findOne({user: req.body.user, pass: req.body.pass}, function(err, doc){
    if(err || !doc) {
      res.send({error: "no user found"});
      return;
    }
    req.session.user = doc.user;
    res.send({success: doc.user});
  });
});

app.post('/deleteQuestion', loggedIn, function(req, res){
  Questions.remove({_id: ObjectID.createFromHexString(req.body.id), videoId: req.body.videoId, user: req.session.user}, function(err, count){
    if(!err && count == 1) {
      io.sockets.in(req.body.videoId).emit('deletedQuestion', req.body.id);
    }
    res.send('ok');
  });
});

app.post('/addQuestion', loggedIn, function(req, res){
	
  var questionTitle = req.body.questionTitle;
	var questionText = req.body.questionText; //the actual text of the question
	var videoId = req.body.videoId; //foreign key to the video associated with the question
	var videoTime = parseInt(req.body.videoTime); //second of the video that the question relates to
	var title = req.body.questionTitle;


	var toInsert = {'videoId': videoId, 'questionTitle': title, 'questionText': questionText, 'videoTime':videoTime, 'upvotes': 0, 'user': req.session.user};

	Questions.insert(toInsert, function(err, data){
		if (err) throw(err);
		var result = data[0];
		result['date'] = getDateFromObjectID(result['_id']);
    	result['_id'] = result['_id'].toString();
		io.sockets.in(videoId).emit('addedQuestion', result);
		res.send({'status': 'ok', 'questionId': result['_id']}); //return the id of the question
	});
});

app.post('/addComment', loggedIn, function(req, res){
	
	var questionId = req.body.questionId; //the related question
	var commentText = req.body.commentText; //the actual text of the comment
	//console.log(questionId)

	var toInsert = {'questionId': questionId, 'commentText': commentText, 'children': [], 'upvotes': 0, 'user': req.session.user};

	Comments.insert(toInsert, function(err, data){
		if(err) throw(err);
		var commentResult = data[0];
		var commentId = commentResult['_id'];
		commentResult['date'] = getDateFromObjectID(commentResult['_id']);
    commentResult['_id'] = commentResult['_id'].toString();
    io.sockets.in(req.body.videoId).emit('addedComment', commentResult);
    res.send({'status': 'ok', 'commentId': commentId }); //return the id of the comment
	});
});

/*
app.get('/getQuestionById/:questionId', function(req, res){
	var questionId = req.params.questionId;
	Questions.findById(questionId, function(err, result){
		if(err) throw err;
		//console.log(result);
		res.send({'status': 'ok', 'data': result});
	});

});

app.get('/getCommentById/:commentId', function(req, res){
	var commentId = req.body.commentId;
	Comments.findById(commentId, function(err, result){
		if(err) throw err;
		res.send({'status': 'ok', 'data': result});
	});
});*/

app.get('/video/:videoId/questions', function(req, res){
	var videoId = req.params.videoId;
  
	var query = {'videoId': videoId};
	//console.log(query);
	Questions.find(query, {sort: {videoTime: 1} }).toArray(function(err, results){
		if(err) throw err;
		//console.log(results);
		for(var i = 0; i < results.length; i = i + 1){
			var result = results[i];
			result.date = getDateFromObjectID(result['_id']);
		}
		res.send({'status': 'ok', 'data': results});
	});
});

app.get('/question/:questionId/comments', function(req, res){
	var questionId = req.params.questionId;
	var query = {'questionId' : questionId};
	Comments.find(query).toArray(function(err, results){
		if(err) throw err;
		//console.log(results);
		for(var i = 0; i < results.length; i = i + 1){
			var result = results[i];
			result.date = getDateFromObjectID(result['_id']);
		}
		res.send({'status': 'ok', 'data': results});	
	});

});

app.get('/video/:id', function(req, res) {
  res.render('video', {id: req.params.id, user: req.session.user});
});

var getDateFromObjectID = function(objectId){
	var objectIdString = objectId.toString();
	var dateHex = objectIdString.substring(0,8);
	var seconds = parseInt(dateHex, 16);
	var ms = seconds * 1000;
	var date = new Date(ms);
	return date; 
}

server.listen(80);
