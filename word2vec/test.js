const w2v = require("./node-word2vec/lib")


w2v.loadModel( __dirname + "/../data/vectors.txt", function( err, model ) {
	console.log( model );

	var similar = model.mostSimilar( 'vc', 20 );
	console.log( similar );
});