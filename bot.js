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

function formatMessage(msg){
    msg = msg.replace("\'", "`")
    //msg = msg.replace("\'", "`")
    return msg
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
    console.log("\x1b[33m",'error: ' + err,"\x1b[37m");

    om.connect();
});

om.on('gotID', function (id) {
    console.log('connected to the server as: ' + id);
});
om.on('waiting', function () {
    console.log('waiting for a stranger.');
});

om.on('connected', function () {
    console.log('connected');
});

var context = []

om.on('gotMessage', function (msg) {
    msg = formatMessage(msg)

    console.log("\x1b[32m",'Stranger: ' + msg,"\x1b[37m");

    context.push(msg)
    converso = converso + "Stranger: "+msg + "\n"

    cleverbot(msg, context).then(response => {
        if(evilbot){
        
        om.startTyping()
        setTimeout(() => {
            if(questionQuestions){
                console.log("\x1b[31m","EvilBot wants to say: " + response+" (Y/N)","\x1b[37m")
                wantSay=response
            }else{
                om.send(response)
                om.stopTyping()
                console.log("\x1b[35m","EvilBot: " + response,"\x1b[37m")
                converso = converso + "Evilbot: "+response+" \n"
                context.push(response)
            }
         

        }, response.length * 100);
        }

        
    });

});

om.on('strangerDisconnected', function () {
    console.log("\x1b[33m",'stranger disconnected.',"\x1b[37m");
});

om.connect();



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
        
        om.send(nice.join(" "))
        console.log("\x1b[36m","You: "+nice.join(" "),"\x1b[37m")
        converso = converso + "You: "+nice.join(" ") + "\n"
    }

    if(he == "y"){
        if(wantSay == ""){
            return
        }
        om.send(wantSay)
        om.stopTyping()

        console.log("\x1b[35m","Evilbot: "+wantSay,"\x1b[37m")
        context.push(wantSay)
        wantSay=""
    }
    if(he == "n"){
        wantSay=""
    }

    if(he == "clear"){
        context=[]
        console.log("\x1b[36m","context clear","\x1b[37m")
    }
    if(he == "next"){
        om.disconnect()
        om.connect()
    }

    if(he == "dontquestion"){
        console.log("\x1b[36m","done","\x1b[37m")
        questionQuestions=false
    }
    if(he == "question"){
        console.log("\x1b[36m","done","\x1b[37m")
        questionQuestions=true
    }

    if(he == "save"){

        fs.writeFile(nice.join(" "), converso, function (err) {
            if (err) return console.log(err);
            console.log("\x1b[36m",'Written > '+nice.join(" "));
        });
    }

    //rl.close();
});