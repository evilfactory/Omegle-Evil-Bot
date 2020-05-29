var Omegle = require('./omeglebot.js');
var om = new Omegle();

var questionQuestions = false;
var automatic = true // haha machine domination
var evilbot = true
om.language = "pt"
var conversationTimeout = 160000

fs = require('fs');

qs = require('query-string');

const readline = require('readline');

const superagent = require("superagent");
const md5 = require("md5");

var converso = ""

var wantSay = ""

var timer;

let cookies;

var Black = "\x1b[30m"
var Red = "\x1b[31m"
var Green = "\x1b[32m"
var Yellow = "\x1b[33m"
var Blue = "\x1b[34m"
var Magenta = "\x1b[35m"
var Cyan = "\x1b[36m"
var White = "\x1b[37m"

var commands = [];

var database = []

function loadDatabase() {

    fs.readFile('./data/database.json', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        database = JSON.parse(data)

        botReady()

        //console.log(database[0].conversation[1])
    });

}


function saveDatabase() {

    fs.writeFile('./data/database.json', JSON.stringify(database), function (err) {
        if (err) return console.log(err);
    });

}

function pushNewConversation(){
    database.push({date: Date.now().toString(), conversation: []})

    saveDatabase()
}

function pushMessageToDatabase(name, msg){
    database[database.length-1].conversation.push({name: name, msg: msg})

    saveDatabase()
}

if(automatic){
    loadDatabase()
}else{
    botReady()
}

function formatMessage(msg) {
    msg = msg.replace("\'", "`")
    //msg = msg.replace("\'", "`")
    return msg
}

function sendMessage(msg, delay = 0) {
    setTimeout(function () {
        if (om.connected()) {
            om.send(msg)
        }
    }, delay)
}

function consoleInfo(msg, color = White, delay = 0, connectedonly = false) {
    setTimeout(function () {
        if (om.connected() || connectedonly == false) {
            console.log(color, msg, White)
        }
    }, delay)
}

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


function botReady(){
    findStranger()
}

function findStranger(){
    if(om.connected()){
        om.disconnect()
    }

    clearTimeout(timer)

    timer = setTimeout(function(){
        sendMessage("Timedout, next stranger.")
        consoleInfo("Evilbot: Timedout, next stranger.", Magenta)

        findStranger()    
    }, conversationTimeout) 

    context=[]

    om.connect()
}

om.on('omerror', function (err) {
    consoleInfo("Error: " + err, Red)

    //om.connect();
});

om.on('gotID', function (id) {
    consoleInfo("Connected to the server as: " + id)
});
om.on('waiting', function () {
    consoleInfo("Waiting for a stranger...")
});


om.on('connected', function () {
    if(automatic){
        pushNewConversation()       
    }

    consoleInfo("Connected to a stranger", Green)
});

var context = []


om.on('gotMessage', function (msg) {
    msg = formatMessage(msg)

    consoleInfo("Stranger: " + msg, Green)

    clearTimeout(timer)

    timer = setTimeout(function(){
        findStranger()
        sendMessage("Timedout, next stranger.")
        consoleInfo("Evilbot: Timedout, next stranger.", Magenta)

    }, conversationTimeout) 


    context.push(msg)
    pushMessageToDatabase("Stranger", msg)
    converso = converso + "Stranger: " + msg + "\n"

    cleverbot(msg, context).then(response => {
        if (evilbot) {

            om.startTyping()
            setTimeout(() => {
                if (questionQuestions) {
                    consoleInfo("Evilbot wants to say: " + response + " (Y/N)", Red)
                    wantSay = response
                } else {
                    sendMessage(response)
                    pushMessageToDatabase("EvilBot", response)
                    om.stopTyping()
                    consoleInfo("Evilbot: " + response, Magenta)

                    converso = converso + "Evilbot: " + response + " \n"
                    
                    context.push(response)
                }


            }, response.length * 100);
        }


    });

});

om.on('strangerDisconnected', function () {
    console.log("\x1b[33m", 'stranger disconnected.', "\x1b[37m");
    converso = converso + "Stranger disconnected. \n"

    if(automatic){
        findStranger()
    }

    //om.connect()
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
        consoleInfo("Command not found", Cyan)
    }

    //rl.close();
});


register("save", function (args) {
    fs.writeFile(nice.join(" "), converso, function (err) {
        if (err) return console.log(err);
        consoleInfo('Written > ' + nice.join(" "), Cyan)
    });
})

register("say", function (args) {

    sendMessage(args.join(" "))
    pushMessageToDatabase("You", args.join(" "))
    consoleInfo("You: " + args.join(" "), Cyan)
    converso = converso + "You: " + args.join(" ") + "\n"

})
register("clear", function (args) {
    context = []
    consoleInfo("Context clear", Cyan)
})

register("next", function (args) {
    if (om.connected()) {
        om.disconnect()
    }
    context = []
    converso = ""

    om.connect()
})

register("language", function (args) {
    om.language = args[0]

    consoleInfo("Language is now " + om.language, Cyan)
})


register("automatic", function (args) {
    if (args[0] == "0") {
        automatic = false
    }
    if (args[0] == "1") {
        automatic = true
    }

    consoleInfo("Automatic is now " + automatic, Cyan)
})

register("question", function (args) {
    if (args[0] == "0") {
        questionQuestions = false
    }
    if (args[0] == "1") {
        questionQuestions = true
    }

    consoleInfo("Question is now " + questionQuestions, Cyan)
})

register("ai", function (args) {
    if (args[0] === "0") {
        evilbot = false
    }

    if (args[0] === "1") {
        evilbot = true
    }

    consoleInfo("AI is now " + evilbot, Cyan)
})

register("y", function (args) {

    if (wantSay == "") {
        return
    }
    sendMessage(wantSay)
    om.stopTyping()

    converso = converso + "EvilBot: " + wantSay + "\n"
    consoleInfo("Evilbot: " + wantSay, Magenta)
    pushMessageToDatabase("Evilbot", wantSay)
    context.push(wantSay)
    wantSay = ""

})

register("n", function (args) {
    wantSay = ""
    om.stopTyping()
})