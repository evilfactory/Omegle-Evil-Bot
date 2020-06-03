const readline = require('readline');
const fs = require('fs');
var colors = require('colors');

var databaseName = "fundatabase.json";
var databaseDate = 1591129182536;
var delay = 2800;

var Black = "\x1b[30m"
var Red = "\x1b[31m"
var Green = "\x1b[32m"
var Yellow = "\x1b[33m"
var Blue = "\x1b[34m"
var Magenta = "\x1b[35m"
var Cyan = "\x1b[36m"
var White = "\x1b[37m"

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}


function consoleInfo(msg, delay = 0) {
    setTimeout(function () {
        console.log(msg)

    }, delay)
}

colors.setTheme({
    silly: 'rainbow',
    info: 'cyan',
    subinfo: 'brightCyan',
    evilbot: 'brightMagenta',
    subevilbot: 'magenta',
    stranger: 'brightGreen',
    substranger: 'green',
    error: 'red',
    warn: 'yellow',
    feedback: 'blue',
    question: 'brightMagenta'
  });


function printDatabase() {

    consoleInfo("Playing conversation ".info+(databaseDate+"").subinfo)

    fs.readFile('./data/' + databaseName, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        var database = JSON.parse(data)

        for (var i = 0; i < database.length; i++) {
            if (database[i].date == databaseDate) {
                var conv = database[i].conversation;

                for (var j = 0; j < conv.length; j++) {

                    if (conv[j].name == "EvilBot") {
                        consoleInfo("Bot: ".evilbot + conv[j].msg.subevilbot, delay*j)
                    } else {
                        consoleInfo("Stranger: ".stranger + conv[j].msg.substranger, delay*j)
                    }

                }

                consoleInfo("Stranger disconnected.".warn, delay*conv.length-1)

            }
        }

        

    })
}


printDatabase();