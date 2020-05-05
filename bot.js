const cleverbot = require("cleverbot-free");
var Omegle = require('omegle-node');
var om = new Omegle(); //create an instance of `Omegle`
 
om.on('omerror',function(err){
    console.log('error: ' + err);
});
 
om.on('gotID',function(id){
    console.log('connected to the server as: ' + id);
});
om.on('waiting', function(){
    console.log('waiting for a stranger.');
});
 
om.on('connected',function(){
    console.log('connected');
});
 
var context = []

om.on('gotMessage',function(msg){
    console.log('Stranger: ' + msg);
     
    context.push(msg)

    cleverbot(msg, context).then(response => {
	console.log(" EvilBot: "+response)
        om.send(response)

	context.push(response)
    });
 
});
 
om.on('strangerDisconnected',function(){
    console.log('stranger disconnected.');
});
 
om.connect();
