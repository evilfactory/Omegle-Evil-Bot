const w2v = require("./node-word2vec/lib")
const fs = require('fs');

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}


var Black = "\x1b[30m"
var Red = "\x1b[31m"
var Green = "\x1b[32m"
var Yellow = "\x1b[33m"
var Blue = "\x1b[34m"
var Magenta = "\x1b[35m"
var Cyan = "\x1b[36m"
var White = "\x1b[37m"

w2v.loadModel( __dirname + "/../data/vectors.txt", function( err, model ) {
	console.log( model );

	var string = "bot"
	//var last = "quantos anos?"

	for(var i=0; i < 30; i++){
		var similar = model.mostSimilar( string, 26 );
		

		var rnd = getRndInteger(0,5)

		string = string + " " + similar[rnd].word
		//last = similar[rnd].word
	}

	console.log( string );

	//console.log(model.analogy( 'vc', [ 'nada', 'nada' ], 10 ));
});




fs.readFile('../data/database2.json', 'utf8', function (err, data) {
	if (err) {
		return console.log(err);
	}

	database = JSON.parse(data)
	
	for(var i=0; i < database.length; i++){
		
		if(database[i].date == "1590921978128"){
			for(var j=0; j<database[i].conversation.length; j++){
				if(database[i].conversation[j].name == "Stranger"){
					console.log(Cyan,database[i].conversation[j].name+": "+database[i].conversation[j].msg)
				}else{
					console.log(Green,database[i].conversation[j].name+": "+database[i].conversation[j].msg)
				}
			}
		}
	}
	

	return;
	
	var rnd = returnRandomConversation(10)


	for(var j=0; j<database[rnd].conversation.length; j++){
		if(database[rnd].conversation[j].name == "Stranger"){
			console.log(Cyan,database[rnd].conversation[j].name+": "+database[rnd].conversation[j].msg)
		}else{
			console.log(Green,database[rnd].conversation[j].name+": "+database[rnd].conversation[j].msg)
		}
	}

	
});

function returnRandomConversation(minLenght){
	var rnd = getRndInteger(0, database.length-1)

	if(database[rnd].conversation.length < minLenght){
		console.log(rnd)
		return returnRandomConversation(minLenght)
	}else{
		return rnd
	}
}


