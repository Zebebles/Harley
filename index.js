var forever = require('forever-monitor');
const snekfetch = require("snekfetch");
const express = require("express");
const app = express();
const http = require('http').createServer(app).listen(3002);
const io = require('socket.io-client');
const auth = require("./resources/auth.json");
const Git = require("simple-git")(__dirname);

console.log("Listening on port 3002");

var socket;

var harley = new (forever.Monitor)('harley.js', {
    max: 3,
    args: ["-l logs.txt"],
});
harley.log = "";
harley.start();

harley.on('stdout', data => {
    data = data.toString().replace(/(\n\r)|(\r\n)/g, "<br/>") + "<br/>";
    harley.log += data;
    socket.emit('output', data);
});

harley.on("stderr", data => {
    data = data.toString().replace(/(\n\r)|(\r\n)/g, "<br/>") + "<br/>";
    harley.log += data;
    socket.emit('output', data);
});

harley.on('restart', () => 
{
    harley.kill(true);
    setTimeout(() => process.exit(1), 100);
});

connect();

function connect()
{
    socket = io.connect('https://www.harleybot.me:8443/server/parent?password=' + auth.password);
    
    socket.on('restart', () => 
    {
        console.log("Harley restarted via API endpoint.");
        harley.restart();
    });
    
    socket.on('stop', () => {
        harley.kill(true);
        console.log("Process killed via api endpoint.");
    })
    
    socket.on('pull', () => 
        Git.pull((err, update) => 
            console.log(err ? `Error pulling from api endpoint\n${err}` : `Git pull via api endpoint successfull.`)));
    
    socket.on('send_output', () => 
        socket.emit('output', harley.log));

    socket.on('alive', fn => {
        fn(harley.running);
    })
}



app.get('/reconnect', (req, res) => 
{
    if(req.query.pw == auth.password)
    {
        socket.connect();
        setTimeout(() => socket.emit('output', harley.log), 2500);
        res.sendStatus(200);
    }
    else
        res.sendStatus(401);
})