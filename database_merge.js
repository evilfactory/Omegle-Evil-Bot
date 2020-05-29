const fs = require('fs');

fs.readFile('./data/database.json', 'utf8', function (err, data) {
	if (err) {
		return console.log(err);
	}

	var database1 = JSON.parse(data)

    fs.readFile('./data/database2.json', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
    
        var database2 = JSON.parse(data)

        //TODO: merge databases lol
    
    });


});