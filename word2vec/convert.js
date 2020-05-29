const fs = require("fs")
const w2v = require("word2vec")

var database;

var rawdata = ""

fs.readFile('../data/database.json', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    database = JSON.parse(data)

    console.log("Converting data to raw...")

    for (var i = 0; i < database.length; i++) {
        var conversation = database[i].conversation;

        for (var j = 0; j < conversation.length; j++) {
            rawdata = rawdata + "\n" + conversation[j].msg
        }
    }
    
    fs.writeFile("../data/input.txt",rawdata, function (err) {
        if (err) throw err;

        console.log("Converting data to phrases...")
        
        w2v.word2phrase(__dirname + '/../data/input.txt', __dirname + '/../data/phrases.txt', {
            threshold: 5,
            debug: 2,
            minCount: 2
        });
        

    });

});

