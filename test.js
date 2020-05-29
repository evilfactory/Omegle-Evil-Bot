const fs = require("fs")

var database;

fs.readFile('database.json', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    database = JSON.parse(data)

    //console.log(database)

});

