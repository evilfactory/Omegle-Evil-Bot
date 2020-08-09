Omegle = require("./omeglebot.js");
logger = require("./logger.js")
fs = require("fs")
readline = require('readline');

rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});



//var oldLog = console.log

//console.log = function(a){
//    console.trace()
//    oldLog(a)
//};

var walk = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

function createStranger(name, autoconnect = false, language = "en") {
    this.om = new Omegle();
    this.om.language = language
    this.autoconnect = autoconnect
    this.name = name

    this.events = []

    var _this = this

    this.om.on('omerror', function (err) {
        logger.log(err, logger.logError)
        _this.emit("error", err)
    });

    this.om.on('gotID', function (id) {
        logger.log(_this.name + ' connected to the server as: ' + id, logger.logInfo)
        _this.emit("gotID", id)
    });

    this.om.on('waiting', function () {
        logger.log(_this.name + ' waiting for someone.', logger.logInfo)
        _this.emit("waiting")
    });

    this.om.on('connected', function () {
        logger.log(_this.name + ' connected to someone', logger.logSuccess)
        _this.emit("connected")
    });

    this.om.on('gotMessage', function (msg) {
        logger.log(_this.name + ': ' + msg, logger.logMessage1)
        _this.emit("message", msg)
    });

    this.om.on('strangerDisconnected', function () {
        logger.log(_this.name + ' disconnected.', logger.logWarn)

        _this.emit("disconnected")

        if (_this.autoconnect) {
            _this.om.connect()
        }
    });

    this.on = function (name, func) {
        _this.events[name] = func
    }

    this.emit = function (name, ...args) {
        if (!_this.events[name]) { return }
        _this.events[name](...args)
    }

    this.sendMessage = function (msg) {
        _this.om.send(msg)
    }

    this.startTyping = function(){
        _this.om.startTyping()
    }

    this.stopTyping = function(){
        _this.om.stopTyping()
    }

    this.connect = function(){
        _this.om.connect()
    }

    if (this.autoconnect) {
        this.om.connect();
    }

}

function createConsoleInputManager(){
    var _this = this
    this.events = []

    rl.on('line', (msg) => {
        for(var i in _this.events){
            _this.events[i](msg)
        }
    })

    this.simulateInput = function(input){
        logger.log("> " + input)
        for(var i in _this.events){
            _this.events[i](input)
        }
    }

    this.on = function(func){
        _this.events.push(func)
    }
}

consoleInputManager = new createConsoleInputManager()

var processArgs = process.argv.slice(2).join(" ").split(",");

function do_stuff_because_im_sad(i){
    setTimeout(function(){
        consoleInputManager.simulateInput(processArgs[i])
    }, (i+1) * 100)
}

if(processArgs[0] != ''){
    for(var i in processArgs){
        do_stuff_because_im_sad(i)
    }
}

var modeList = []
var stillChoosingScript = true

walk("modes", function (err, results) {
    if (err) {
        logger.log("Error while opening modes folder", logError)

    } else {
        logger.log("Loading avaiable scripts...", logger.logInfo)

        modeList = results

        ready()

    }
})

function ready() {

    logger.log("Choose the script that you want use: ", logger.logInfo)

    for (var file in modeList) {
        logger.log(file + ") " + modeList[file], logger.logMagenta)
    }

    consoleInputManager.on((msg) => {
        var args = msg.split(" ")
        var command = args.shift().toLowerCase()

        if(!stillChoosingScript){return}

        if (modeList[msg]) {

            stillChoosingScript=false;

            try {
                eval(fs.readFileSync(modeList[msg]) + '')
            } catch (e) {
                logger.log("Script error while running script " + modeList[file], logger.logError)
                logger.log(e)
            }

        } else {
            logger.log("Not found", logger.logWarn)
        }
    });

}