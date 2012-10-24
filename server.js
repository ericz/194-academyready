var express = require('express');

var app = express();
var mongo = require('mongoskin');
var ObjectID = require('mongoskin').ObjectID;
var db = mongo.db('localhost:27017/194?auto_reconnect');
var Questions = db.collection('Questions');
var Comments = db.collection('Comments')

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());


app.post('/addQuestion', function(req, res){
	

	var questionText = req.body.questionText; //the actual text of the question
	var videoId = req.body.videoId; //foreign key to the video associated with the question
	var videoTime = parseInt(req.body.videoTime); //second of the video that the question relates to


	var toInsert = {'videoId': videoId, 'questionText': questionText, 'videoTime':videoTime, 'comments': [], 'upvotes': 0};

	Questions.insert(toInsert, function(err, data){
		if (err) throw(err);
		var result = data[0];
		res.send({'status': 'ok', 'questionId': result['_id']}); //return the id of the question
	});
});

app.post('/addComment', function(req, res){
	
	var questionId = req.body.questionId; //the related question
	var commentText = req.body.commentText; //the actual text of the comment

	var toInsert = {'questionId': questionId, 'commentText': commentText, 'children': [], 'upvotes': 0};

	Comments.insert(toInsert, function(err, data){
		if(err) throw(err);
		var result = data[0];
		var commentId = result['_id'];
		var toUpdate = {'$push':{comments: commentId}};

		Questions.updateById(questionId, toUpdate, function(err, result){
			if (err) throw(err);
			res.send({'status': 'ok', 'commentId': commentId }); //return the id of the comment
		});
	});
});

app.get('/getQuestionById/:questionId', function(req, res){

	var questionId = req.params.questionId;
	Questions.findById(questionId, function(err, result){
		if(err) throw err;
		console.log(result);
		res.send({'status': 'ok', 'data': result});
	});

});

app.get('/getCommentById/:commentId', function(req, res){
	var commentId = req.body.commentId;
	Comments.findById(commentId, function(err, result){
		if(err) throw err;
		res.send({'status': 'ok', 'data': result});
	});
});

app.get('/getQuestionByVideoIdAndVideoTime', function(req, res){
	var videoId = req.query.videoId;
	var videoTime = parseInt(req.query.videoTime);
	var query = {'videoId': videoId , 'videoTime': videoTime};
	console.log(query);
	Questions.find(query).toArray(function(err, results){
		if(err) throw err;
		console.log(results);
		res.send({'status': 'ok', 'data': results});
	});
});

app.listen(80);