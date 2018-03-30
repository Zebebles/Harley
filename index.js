var forever = require('forever-monitor');
const snekfetch = require("snekfetch");
const express = require("express");
let app = express();
const auth = require("./resources/auth.json");
let ips = new Array();
const Git = require("simple-git")(__dirname);

console.log("Listening on port 3002");
setInterval(() => ips = new Array(),10800000); //reset the array every 3 hours

app.listen(3002);
app.use(function(req, res, next)
{
    res.header('Access-Control-Allow-Origin', "*");
    if(req.ip == "::ffff:" + auth.webserver.split(":")[0] || req.ip == "::1")//if the request is from localhost or webserver
    {
        next();
    }
    else
        res.sendStatus(401);    //send an unauthorised error.
});


app.get("/restart", function(req, res) {
    if(req.query.hard==1){
        res.sendStatus(200);
        console.log("Harley hard restarted via api endpoint.");            
        harley.stop();
        setTimeout(() => {
            process.exit(1);
        },1000);
        return;
    }
    console.log("Harley restarted via api endpoint.");    
    harley.restart();
    res.sendStatus(200);
});

app.get("/stop", function(req, res) {
    harley.dontsend = true;
    harley.kill(true);
    console.log("Process killed via api endpoint.");
    res.sendStatus(200);
});

app.get("/pull", function(req, res) {
    Git.pull((err, update) => {
        if(err){
            res.sendStatus(500);
            console.log("Error pulling from api endpoint\n" + err);
        }
        console.log("Git Pull via api endpoint successfull.");
        res.send(update.summary);
    });
});

app.get("/output", function(req,res){
    res.send(harley.log);
});


/*status messages
400 -> bad request
401 -> unauthorised // using for when too many requests are sent from 1 ip
500 -> internal server error // using when the bot cant send me the message for whateve reason
200 -> ok
*/

//start Harley
var harley = new (forever.Monitor)('harley.js', {
    max: 3,
    args: ["-l logs.txt"],
});

harley.log = "";

harley.start();

harley.on('exit', () => {
    snekfetch.post('http://' + auth.webserver + '/servers/stopped')
        .send({reason: harley.log})
        .end();
});

harley.on('stdout', data => {
    harley.log += data.toString().replace(/(\n\r)|(\r\n)/g, "<br/>") + "<br/>";
    snekfetch.post('http://' + auth.webserver + '/servers/output')
        .send({output : data.toString().replace(/(\n\r)|(\r\n)/g, "<br/>")})
        .end();});

harley.on("stderr", data => {
    harley.log += data.toString().replace(/(\n\r)|(\r\n)/g, "<br/>") + "<br/>";
    snekfetch.post('http://' + auth.webserver + '/servers/output')
        .send({output : data.toString().replace(/(\n\r)|(\r\n)/g, "<br/>")})
        .end();
});

