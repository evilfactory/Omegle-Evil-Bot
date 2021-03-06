logger.log("Loading cleverbot.js script!", logger.logInfo)

const superagent = require("superagent");
const md5 = require("md5");

var cookies;

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

database = []

function loadDatabase(callback) {
    fs.readFile('./data/database.json', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        database = JSON.parse(data)

        if(callback){callback()}
    });
}

function saveDatabase() {
    fs.writeFile('./data/database.json', JSON.stringify(database), function (err) {
        if (err) return console.log(err);
    });
}


function pushNewConversation(lang) {
    database.push({ 'date': Date.now().toString(), 'language': lang, conversation: [] })

    saveDatabase()
}

function pushMessageToDatabase(name, msg) {
    database[database.length - 1].conversation.push({ name: name, msg: msg, date: Date.now().toString() })
    sendToAPIServer(name, msg)

    saveDatabase()
}


function filterText(text) {
    //return text.replace(/[^\x00-\x7F]/g, "")
    return text
}

var APIServerMessageList = []

function sendToAPIServer(name, msg) {
    if (!apiserverIO) { return }
    apiserverIO.emit("msg", { name: name, msg: filterText(msg) })
    APIServerMessageList.push({ name: name, msg: filterText(msg) })

    if (APIServerMessageList.length > 50) {
        APIServerMessageList.splice(0, 1)
    }
}

function runAPIServer() {

    logger.log("API server running on port 3007")

    apiserverIO = require("socket.io")(3007)

    apiserverIO.on('connection', function (socket) {
        socket.emit("datafromserver", APIServerMessageList)
        socket.emit("msg", {name: "SERVER", msg: "Language is set to " + stranger.om.language})

        logger.log("User connected to API Server", logger.logInfo);

    })
}

var stranger = new createStranger("Stranger", false)

var context = []

var ready = false
var cleverbotEnabled = true
var question = false
var timetoquit = 0
var autoquit = -1
var apiserverIO;

var currentQuestion = ""

setInterval(function () {
    if (autoquit < 0) { return }
    if (!stranger.om.connected()) { return }

    timetoquit = timetoquit - 1

    if (timetoquit <= 0) {
        logger.log("Stranger is afk, quitting", logger.logWarn)
        sendToAPIServer("SERVER", "Stranger is afk, quitting")
        timetoquit = autoquit
        stranger.connect()
    }
}, 1000)

stranger.on("gotID", function () {
    timetoquit = autoquit
})

stranger.on("connected", function () {
    context = []
    pushNewConversation(stranger.om.language)

    sendToAPIServer("SERVER", "Connected to a stranger")
})

stranger.on("disconnected", function () {
    sendToAPIServer("SERVER", "Stranger disconnected")
})

stranger.on("recaptchaRequired", function () {
    setTimeout(function () {
        stranger.connect()
    }, 900000)
})

stranger.on("message", function (msg) {
    timetoquit = autoquit

    context.push(msg)
    pushMessageToDatabase(stranger.name, msg)

    stranger.startTyping()

    cleverbot(msg, context).then(response => {
        if (!stranger.om.connected()) { return }
        if (!cleverbotEnabled) { return }

        if (question) {
            logger.log("Cleverbot wants to say " + response + " (Y/N)", logger.logMagenta)
            currentQuestion = response
        } else {

            setTimeout(function () {

                logger.log("Cleverbot: " + response, logger.logMessage2)
                pushMessageToDatabase("Cleverbot", response)
                stranger.sendMessage(response)

                context.push(response)

                stranger.stopTyping()

            }, response.length * 50)
        }
    })
})

consoleInputManager.on(function (msg) {
    var args = msg.split(" ")
    var command = args.shift().toLowerCase()
    var joinArg = args.join(" ")

    if (command == "find") {
        stranger.connect()
    }

    if (command == "y") {
        if (currentQuestion == "") { return }

        logger.log("Cleverbot: " + currentQuestion, logger.logMessage2)
        pushMessageToDatabase("Cleverbot", currentQuestion)
        stranger.sendMessage(currentQuestion)

        context.push(currentQuestion)

        stranger.stopTyping()

        currentQuestion = ""
    }

    if (command == "n") {
        currentQuestion = ""
    }

    if (command == "say") {

        stranger.sendMessage(joinArg)
        pushMessageToDatabase("You", joinArg)

        logger.log("You: " + joinArg, logger.logMessage3)
        context.push(joinArg)
    }

    if (command == "cleverbot") {
        if (joinArg == "0") {
            cleverbotEnabled = false
            logger.log("Cleverbot disabled", logger.logInfo)
        } else {
            cleverbotEnabled = true
            logger.log("Cleverbot enabled", logger.logInfo)
        }
    }

    if (command == "autoconnect") {
        if (joinArg == "0") {
            stranger.autoconnect = false
            logger.log("Automatic connect disabled", logger.logInfo)
        } else {
            stranger.autoconnect = true
            logger.log("Automatic connect enabled", logger.logInfo)
        }
    }

    if(command == "lang"){
        logger.log("Language set to "+joinArg, logger.logInfo)
        stranger.om.language = joinArg
    }

    if (command == "question") {
        if (joinArg == "0") {
            question = false
            logger.log("Question disabled", logger.logInfo)
        } else {
            question = true
            logger.log("Question enabled", logger.logInfo)
        }
    }

    if (command == "autoquit") {
        autoquit = parseFloat(joinArg)
        logger.log("Autoquit time set to " + autoquit, logger.logInfo)
        timetoquit = autoquit
    }

    if (command == "apiserver") {
        runAPIServer()
    }
})


loadDatabase(function () {

    logger.log("Type 'find' to connect a stranger\n" +
        "'say text' to send something to the stranger\n" +
        "'autoconnect 0/1' to connect automatically\n" +
        "'question 0/1' to question cleverbot responses\n" +
        "'autoquit number' disconnect from stranger when he is afk(set to -1 to disable)\n" +
        "'apiserver' starts api server\n" +
        "'lang language' sets language\n" +
        "'cleverbot 0/1' to disable/enable cleverbot", logger.logInfo)

    ready = true
})

