const w2v = require("./node-word2vec/lib")
const fs = require('fs');

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}

/*

w2v.loadModel( __dirname + "/../data/vectors.txt", function( err, model ) {
	console.log( model );

	var string = "gay"
	var last = "gay"

	for(var i=0; i < 100; i++){
		var similar = model.mostSimilar( last, 26 );
		

		var rnd = getRndInteger(0,25)

		string = string + " " + similar[rnd].word
		last = similar[rnd].word
	}

	console.log( string );
});

*/


fs.readFile('../data/database.json', 'utf8', function (err, data) {
	if (err) {
		return console.log(err);
	}

	database = JSON.parse(data)

	for(var i=0; i < database.length; i++){
		
		if(database[i].date == "1590729928454"){
			console.log(database[i].conversation)
		}
	}
});