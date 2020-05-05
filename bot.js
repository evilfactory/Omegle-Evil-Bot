var questionQuestions = false;


var Omegle = require('omegle-node');
var om = new Omegle();

const readline = require('readline');

const superagent = require("superagent");
const md5 = require("md5");

var evilbot=true

var wantSay=""

let cookies;

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
    console.log('error: ' + err);

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
    console.log('Stranger: ' + msg);

    context.push(msg)

    cleverbot(msg, context).then(response => {
        if(evilbot){
        
        om.startTyping()
        setTimeout(() => {
            if(questionQuestions){
                console.log(" EvilBot wants to say: " + response+" (Y/N)")
                wantSay=response
            }else{
                om.send(response)
                om.stopTyping()
                console.log(" EvilBot: " + response)
            }
         

        }, msg.length * 20);
        }

        context.push(response)
    });

});

om.on('strangerDisconnected', function () {
    console.log('stranger disconnected.');
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
        console.log("you: "+nice.join(" "))
    }

    if(he == "y"){
        if(wantSay == ""){
            return
        }
        om.send(wantSay)
        om.stopTyping()

        console.log("Evilbot: "+wantSay)
        wantSay=""
    }
    if(he == "n"){
        wantSay=""
    }

    //rl.close();
});