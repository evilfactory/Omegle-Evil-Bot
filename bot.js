var questionQuestions = true;

fs = require('fs');

qs = require('query-string');

var Omegle = require('./omeglebot.js');
var om = new Omegle();

const readline = require('readline');

const superagent = require("superagent");
const md5 = require("md5");

var evilbot=true

var converso = ""

var wantSay=""

let cookies;


var Black = "\x1b[30m"
var Red = "\x1b[31m"
var Green = "\x1b[32m"
var Yellow = "\x1b[33m"
var Blue = "\x1b[34m"
var Magenta = "\x1b[35m"
var Cyan = "\x1b[36m"
var White = "\x1b[37m"

function formatMessage(msg){
    msg = msg.replace("\'", "`")
    //msg = msg.replace("\'", "`")
    return msg
}

function sendMessage(msg, delay=0){
    setTimeout(function(){
        if(om.connected()){
            om.send(msg)
        }
    }, delay)
}

function consoleInfo(msg, color=White, delay=0){
    setTimeout(function(){
        console.log(color, msg, White)
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

om.on('omerror', function (err) {
    consoleInfo("Error: "+err, Red)

    //om.connect();
});

om.on('gotID', function (id) {
    consoleInfo("Connected to the server as: "+id)
});
om.on('waiting', function () {
    consoleInfo("Waiting for a stranger...")
});

om.on('connected', function () {
    consoleInfo("Connected to a stranger", Green)

    sendMessage("Starting system...", 100)
    consoleInfo("Evilbot: Starting system...", Magenta, 100)

    sendMessage("Done.", 2000)
    consoleInfo("Evilbot: Done.", Magenta, 2000)

    sendMessage("Checking AI status...", 6000)
    consoleInfo("Evilbot: Checking AI status.", Magenta, 6000)

    sendMessage("Status: OK", 10000)
    consoleInfo("Evilbot: Status: OK.", Magenta, 10000)

    sendMessage("Hello world!", 11000)
    consoleInfo("Evilbot: Hello world!", Magenta, 11000)

});

var context = []

om.on('gotMessage', function (msg) {
    msg = formatMessage(msg)

    consoleInfo("Stranger: "+msg, Green)

    context.push(msg)
    converso = converso + "Stranger: "+msg + "\n"

    cleverbot(msg, context).then(response => {
        if(evilbot){
        
        om.startTyping()
        setTimeout(() => {
            if(questionQuestions){
                consoleInfo("Evilbot wants to say: "+response+" (Y/N)", Red)
                wantSay=response
            }else{
                sendMessage(response)
                om.stopTyping()
                consoleInfo("Evilbot: "+response, Magenta)

                converso = converso + "Evilbot: "+response+" \n"
                context.push(response)
            }
         

        }, response.length * 100);
        }

        
    });

});

om.on('strangerDisconnected', function () {
    console.log("\x1b[33m",'stranger disconnected.',"\x1b[37m");
    converso = converso + "Stranger disconnected. \n"
});

om.connect([]);



const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (answer) => {

    var nice = answer.split(" ")
    var he = nice.shift().toLowerCase()

    if(he == "start"){
        evilbot=true
    }
    if(he == "stop"){
        evilbot=false
    }
    if(he == "say"){
        
        sendMessage(nice.join(" "))
        consoleInfo("You: "+nice.join(" "), Cyan)
        converso = converso + "You: "+nice.join(" ") + "\n"
    }

    if(he == "y"){
        if(wantSay == ""){
            return
        }
        sendMessage(wantSay)
        om.stopTyping()

        converso = converso + "EvilBot: "+wantSay + "\n"
        consoleInfo("Evilbot: "+wantSay, Magenta)
        context.push(wantSay)
        wantSay=""
    }
    if(he == "n"){
        wantSay=""
        om.stopTyping()
    }

    if(he == "clear"){
        context=[]
        consoleInfo("Context clear", Cyan)
    }
    if(he == "next"){
        if(om.connected()){
            om.disconnect()
        }
        context = []
        converso = ""

        om.connect()
    }

    if(he == "dontquestion"){
        consoleInfo("Done", Cyan)
        questionQuestions=false
    }
    if(he == "question"){
        consoleInfo("Done", Cyan)
        questionQuestions=true
    }

    if(he == "save"){

        fs.writeFile(nice.join(" "), converso, function (err) {
            if (err) return console.log(err);
            consoleInfo('Written > '+nice.join(" "), Cyan)
        });
    }

    //rl.close();
});