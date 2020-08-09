var FgBlack = "\x1b[30m"
var FgRed = "\x1b[31m"
var FgGreen = "\x1b[32m"
var FgYellow = "\x1b[33m"
var FgBlue = "\x1b[34m"
var FgMagenta = "\x1b[35m"
var FgCyan = "\x1b[36m"
var FgWhite = "\x1b[37m"

var Reset = "\x1b[0m"
var Bright = "\x1b[1m"
var Dim  = "\x1b[2m"
var Underscore = "\x1b[4m"
var Blink = "\x1b[5m"
var Reverse = "\x1b[7m"
var Hidden = "\x1b[8m"

this.verbose = true

this.logWarn = [FgYellow, "[!]"]
this.logError = [FgRed, "[ERROR]"]
this.logInfo = [FgCyan, "[?]"]
this.logSuccess = [FgGreen, "[+]"]
this.logDefault = [FgWhite, ""]
this.logMagenta = [FgMagenta, ""]
this.logMessage1 = [FgCyan, ""]
this.logMessage2 = [FgGreen, ""]
this.logMessage3 = [FgMagenta, ""]
this.logVerbose = [FgBlue, "[=]"]

this.logs = []

this.logs.push(["\nBOT RESTART\n"])

this.log = function (message, logType = this.logDefault) {

    this.logs.push([logType[1] + " " + message, Date.now()])

    if (logType == this.logVerbose) {
        if (this.verbose == false) {
            return
        }
    }

    console.log(logType[0] + logType[1], message, FgWhite)

    this.saveLog()
}

this.saveLog = function () {

    var stdout = ""

    for(var i=0; i < this.logs.length; i++){
        if(this.logs[i][1]){
            var date = new Date(this.logs[i][1]).toISOString().
            replace(/T/, ' ').  
            replace(/\..+/, '')  

            stdout = stdout + date + ": " + this.logs[i][0] + "\n"
        }else{
            stdout = stdout + " " + this.logs[i][0] + "\n"
        }
    }

    fs.appendFile("data/log.txt", stdout, function (err) {
        if (err) { return logger.log("Error while trying to save logs to log.txt: " + err, logger.logError); }
    })

    this.logs = []
}