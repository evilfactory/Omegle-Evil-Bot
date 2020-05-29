'use strict';

const fs = require("fs")
const w2v = require("./node-word2vec/lib")

var database;

var rawdata = ""


fs.readFile(__dirname+'/../data/database.json', 'utf8', function (err, data) {
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

    
    fs.writeFile(__dirname+"/../data/input.txt",rawdata, function (err) {
        if (err) throw err;

        console.log("Converting data to phrases...")
        
        w2v.word2phrase(__dirname + "/../data/input.txt", __dirname + '/../data/phrases.txt', {
            threshold: 5,
            debug: 2,
            minCount: 2
        }, function(){

            console.log("Converting data to vectors...")

            w2v.word2vec( __dirname + "/../data/phrases.txt", __dirname + '/../data/vectors.txt', {
                cbow: 1,
                size: 200,
                window: 8,
                negative: 25,
                hs: 0,
                sample: 1e-4,
                threads: 20,
                iter: 15,
                minCount: 2
            });

            

        });
        

    });

    

});

