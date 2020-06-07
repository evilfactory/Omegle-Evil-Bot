var Omegle = require('./omeglebot.js');
var om = new Omegle();
var om2 = new Omegle();

var colors = require('colors');

var config = require('./config.js')

var questionQuestions = config.question;
var automatic = config.automatic // haha machine domination
var evilbot = config.ai
var mitm = config.mitm
var databaseName = config.databaseName
var spyMode = config.spyMode
var setQuestionToTrueEveryConnect = config.setQuestionToTrueEveryConnect
var logDatabase = config.logDatabase
om.language = config.language
om2.language = config.language
var conversationTimeout = config.conversationTimeout

fs = require('fs');

qs = require('query-string');

const readline = require('readline');

const superagent = require("superagent");
const md5 = require("md5");

var wantSay = ""
var whatStranger = false;

var timer;

let cookies;

var commands = [];

var database = []

var dontCallAgain=false

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
    if (!logDatabase) { return; }
    database.push({ date: Date.now().toString(), conversation: [] })

    saveDatabase()
}

function pushMessageToDatabase(name, msg) {
    if (!logDatabase) { return; }
    database[database.length - 1].conversation.push({ name: name, msg: msg })

    saveDatabase()
}

function sendMessageAndLog(msg, name = "", database = false, sendtoomegle = false) {
    if (!database) {
        console.log(msg)

        if (sendtoomegle) {
            om.send(colors.strip(msg));
        }

    } else {
        console.log(name + ":" + " " + msg)

        if (sendtoomegle) {
            om.send(colors.strip(msg));
        }

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
    if (om2.connected()) {
        om2.disconnect();
    }

    dontCallAgain=false

    if(setQuestionToTrueEveryConnect){
        questionQuestions=true
    }

    clearTimeout(timer)

    timer = setTimeout(function () {
        if (automatic) {

            sendMessageAndLog("Timedout, next stranger.", "Evilbot".evilbot)

            findStranger()

        }
    }, conversationTimeout)

    om.connect(false,spyMode)
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


om.on('typing', function () {
    if (mitm && om2.connected()) {
        om2.startTyping();
    }
});

om.on('stoppedTyping', function () {
    if (mitm && om2.connected()) {
        om2.stopTyping();
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

    
    if (mitm && dontCallAgain == false) {
        setTimeout(function(){
            om2.connect(false,spyMode)
        }, 1000)
    }
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

    if (mitm) {
        if (questionQuestions) {

            sendMessageAndLog(("Stranger wants to say: " + msg + " (Y/N)").question)
            wantSay = msg
            whatStranger = false
        } else {
            sendMessageAndLog(msg.substranger, "Stranger".stranger, true, false)

            if(om2.connected()){
                om2.send(msg)
            }
        }

        return;
    }

    sendMessageAndLog(msg.substranger, "Stranger".stranger, true, false)


    cleverbot(msg, context).then(response => {
        if (evilbot) {

            om.startTyping()
            setTimeout(() => {
                if (questionQuestions) {
                    sendMessageAndLog(("Evilbot wants to say: " + response + " (Y/N)").question)
                    wantSay = response
                } else {
                    sendMessageAndLog(response.subevilbot, "Evilbot".evilbot, true, true)

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


om2.on('omerror', function (err) {
    sendMessageAndLog(("Error 2: " + err).error)
});

om2.on('gotID', function (id) {
    if (id == null) {
        sendMessageAndLog("Planet earth is blue, and you are banned.".error)
    } else {
        sendMessageAndLog(("Connected to the server 2 as: ".info + id.subinfo))
    }
});

om2.on('connected', function () {
    sendMessageAndLog("Connected to stranger 2".info)
});


om2.on('gotMessage', function (msg) {
    if (questionQuestions) {

        sendMessageAndLog(("Stranger 2 wants to say: " + msg + " (Y/N)").question)
        wantSay = msg
        whatStranger = true
    } else {

        sendMessageAndLog(msg.substranger, "Stranger2".stranger, true, false)
        if(om.connected()){
            om.send(msg);
        }
    }
});

om2.on('typing', function () {
    if(om.connected()){
        om.startTyping();
    }
});

om2.on('stoppedTyping', function () {
    if(om.connected()){
        om.stopTyping();
    }
});

om2.on('strangerDisconnected', function () {
    sendMessageAndLog("Stranger 2 disconnected".warn)

    if(automatic){
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

    sendMessageAndLog(args.join(" "), "You".feedback, true, true)
    context.push(args.join(" "))

})

register("say2", function (args) {
    if(mitm){
        sendMessageAndLog(args.join(" "), "You".feedback, true, false)
        om2.send(args.join(" "))
        context.push(args.join(" "))
    }
})

register("say3", function (args) {
    if(mitm){
        sendMessageAndLog(args.join(" "), "You".feedback, true, false)
        om2.send(args.join(" "))
        om.send(args.join(" "))
        context.push(args.join(" "))
    }
})

register("clear", function (args) {
    context = []
    sendMessageAndLog("Context clear".feedback)
})

register("next", function (args) {

    if(args[0] == "1"){
        if(om.connected()){
            om.disconnect()
        }

        if(setQuestionToTrueEveryConnect){
            questionQuestions=true;
        }

        om.connect([], spyMode)
        setQuestionToTrueEveryConnect=true
    }
    if(args[0] == "2"){
        if(om2.connected()){
            om2.disconnect()
        }
        
        if(setQuestionToTrueEveryConnect){
            questionQuestions=true;
        }
        om2.connect([], spyMode)
    }
    if(args[0] != "1" && args[0] != "2"){

        findStranger()

        context = []
    }
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

    if (mitm) {

        if(whatStranger){
            sendMessageAndLog(wantSay.substranger, "Stranger 2".stranger, true, false)
            om.send(wantSay)
        }else{  
            sendMessageAndLog(wantSay.substranger, "Stranger".stranger, true, false)
            dontCallAgain=true
            om2.send(wantSay)
        }
        
    } else {

        om.stopTyping()

        sendMessageAndLog(wantSay.subevilbot, "Evilbot".evilbot, true, true)
        context.push(wantSay)
        wantSay = ""

    }

})

register("n", function (args) {
    wantSay = ""
    om.stopTyping()
})

register("setdatabase", function (args) {
    saveDatabase()

    database = []

    databaseName = args.join(" ");
    sendMessageAndLog(("Database is now" + databaseName).feedback)
})