var Omegle = require('./omeglebot.js');
var om = new Omegle();
var colors = require('colors');

var questionQuestions = false;
var automatic = true // haha machine domination
var evilbot = true
var databaseName = "database.json"
om.language = "pt"
var conversationTimeout = 160000

fs = require('fs');

qs = require('query-string');

const readline = require('readline');

const superagent = require("superagent");
const md5 = require("md5");

var wantSay = ""

var timer;

let cookies;

var commands = [];

var database = []


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

function loadDatabase() {

    fs.readFile('./data/' + databaseName, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        database = JSON.parse(data)

        botReady()

        //console.log(database[0].conversation[1])
    });

}


function saveDatabase() {

    fs.writeFile('./data/' + databaseName, JSON.stringify(database), function (err) {
        if (err) return console.log(err);
    });

}

function pushNewConversation() {
    if (!automatic) { return; }
    database.push({ date: Date.now().toString(), conversation: [] })

    saveDatabase()
}

function pushMessageToDatabase(name, msg) {
    if (!automatic) { return; }
    database[database.length - 1].conversation.push({ name: name, msg: msg })

    saveDatabase()
}

function sendMessageAndLog(msg, name = "", database=false) {
    if (!database) {
        console.log(msg)

    } else {
        console.log(name + ":" + " " + msg)

        om.send(colors.strip(msg));

        pushMessageToDatabase(colors.strip(name), colors.strip(msg))

    }
}

loadDatabase()

// FROM https://github.com/IntriguingTiles/cleverbot-free

var cleverbot = async (stimulus, context = []) => {
    if (cookies == null) {
        // we must get the XVIS cookie before we can make requests to the API
        const req = await superagent.get("https://www.cleverbot.com/");
        cookies = req.header["set-cookie"]; // eslint-disable-line require-atomic-updates
    }

    // why, cleverbot, why do you do need me to do this
    let payload = `stimulus=${escape(stimulus).includes("%u") ? escape(escape(stimulus).replace(/%u/g, "|")) : escape(stimulus)}&`;

    // we're going to assume that the first item in the array is the first message sent
    const reverseContext = context.slice().reverse();

    for (let i = 0; i < context.length; i++) {
        // we're going to assume that the context hasn't been escaped
        payload += `vText${i + 2}=${escape(reverseContext[i]).includes("%u") ? escape(escape(reverseContext[i]).replace(/%u/g, "|")) : escape(reverseContext[i])}&`;
    }

    payload += "cb_settings_scripting=no&islearning=1&icognoid=wsf&icognocheck=";

    payload += md5(payload.substring(7, 33));

    const req = await superagent.post("https://www.cleverbot.com/webservicemin?uc=UseOfficialCleverbotAPI")
        .set("Cookie", cookies)
        .type("text/plain")
        .send(payload);

    return decodeURIComponent(req.header["cboutput"]);
};

// https://github.com/IntriguingTiles/cleverbot-free


function botReady() {
    findStranger()
}

function findStranger() {
    if (om.connected()) {
        om.disconnect()
    }

    clearTimeout(timer)

    timer = setTimeout(function () {
        if (automatic) {

            sendMessageAndLog("Timedout, next stranger.", "Evilbot".evilbot)

            findStranger()

        }
    }, conversationTimeout)

    context = []

    om.connect()
}

om.on('omerror', function (err) {
    sendMessageAndLog(("Error: " + err).error)
});

om.on('gotID', function (id) {
    if (id == null) {
        sendMessageAndLog("Planet earth is blue, and you are banned.".error)
    } else {
        sendMessageAndLog(("Connected to the server as: ".info + id.subinfo))
    }
});
om.on('waiting', function () {
    sendMessageAndLog("Waiting for a stranger...".info)
});

om.on('antinudeBanned', function (res) {
    sendMessageAndLog("Planet earth is blue, and you are banned.".error)
})


om.on('connected', function () {
    pushNewConversation()
    
    sendMessageAndLog("Connected to a stranger".info)
});

var context = []


om.on('gotMessage', function (msg) {

    clearTimeout(timer)

    timer = setTimeout(function () {
        if (automatic) {
            findStranger()
            sendMessageAndLog("Timedout, next stranger.", "Evilbot".evilbot)
        }
    }, conversationTimeout)


    context.push(msg)

    sendMessageAndLog(msg.substranger,"Stranger".stranger, true)
    

    cleverbot(msg, context).then(response => {
        if (evilbot) {

            om.startTyping()
            setTimeout(() => {
                if (questionQuestions) {
                    sendMessageAndLog(("Evilbot wants to say: " + response + " (Y/N)").question)
                    wantSay = response
                } else {
                    sendMessageAndLog(response.subevilbot, "Evilbot".evilbot, true)

                    om.stopTyping()

                    context.push(response)
                }


            }, response.length * 100);
        }


    });

});

om.on('strangerDisconnected', function () {
    sendMessageAndLog("Stranger disconnected".warn)

    if (automatic) {
        findStranger()
    }

});



const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function register(name, callback) {
    commands[name] = callback;
}


rl.on('line', (answer) => {

    var nice = answer.split(" ")
    var he = nice.shift().toLowerCase()

    if (commands[he]) {
        commands[he](nice)
    } else {
        sendMessageAndLog("Command not found".warn)
    }

    //rl.close();
});

/*
register("save", function (args) {
    fs.writeFile(nice.join(" "), converso, function (err) {
        if (err) return console.log(err);
        consoleInfo('Written > ' + nice.join(" "), Cyan)
    });
})
*/

register("say", function (args) {

    sendMessageAndLog(args.join(" "), "You".feedback, true)
    context.push(args.join(" "))

})
register("clear", function (args) {
    context = []
    sendMessageAndLog("Context clear".feedback)
})

register("next", function (args) {
    if (om.connected()) {
        om.disconnect()
    }
    context = []

    om.connect()
})

register("language", function (args) {
    om.language = args[0].trim()

    sendMessageAndLog(("Language is now " + om.language).feedback)
})


register("automatic", function (args) {
    if (args[0] == "0") {
        automatic = false
    }
    if (args[0] == "1") {
        automatic = true
    }

    sendMessageAndLog(("Automatic is now " + automatic).feedback)
})

register("timeout", function (args) {
    conversationTimeout = parseInt(args[0])

    sendMessageAndLog(("Timeout is now " + conversationTimeout).feedback)
})

register("question", function (args) {
    if (args[0] == "0") {
        questionQuestions = false
    }
    if (args[0] == "1") {
        questionQuestions = true
    }

    sendMessageAndLog(("Question is now " + questionQuestions).feedback)
})

register("ai", function (args) {
    if (args[0] === "0") {
        evilbot = false
    }

    if (args[0] === "1") {
        evilbot = true
    }

    sendMessageAndLog(("AI is now " + evilbot).feedback)
})

register("y", function (args) {

    if (wantSay == "") {
        return
    }

    om.stopTyping()

    sendMessageAndLog(wantSay.subevilbot, "Evilbot".evilbot, true)
    context.push(wantSay)
    wantSay = ""

})

register("n", function (args) {
    wantSay = ""
    om.stopTyping()
})

register("setdatabase", function (args) {
    saveDatabase()

    database=[]

    databaseName = args.join(" ");
    sendMessageAndLog(("Database is now" + databaseName).feedback)
})