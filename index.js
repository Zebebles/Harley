var forever = require('forever-monitor');
const express = require("express");
let app = express();
const auth = require("./resources/auth.json");
app.use(function(req,res,next) {res.header("Access-Control-Allow-Origin", "*");next()});  
var http = require("http").Server(app);
var io = require('socket.io')(http);
const fetch = require("node-fetch");
http.listen(3001);
console.log("Listening on port 3001");
let ips = new Array();
setInterval(() => ips = new Array(),10800000); //reset the array every 3 hours
var nodemailer = require('nodemailer');
const Git = require("simple-git")(__dirname);

//initiate mail thingo
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'harley.dis.sup@gmail.com',
      pass: auth.password
    }
});

//listen for contact requests at the api endpoint
app.get("/submitContact", function(req, res) {
    if(!req.query || !req.query.name || !req.query.email || !req.query.subject || !req.query.message)
        return res.sendStatus(400);
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var foundIp = ips.find(i => i.ip == ip);
    if(foundIp && foundIp.count > 5)
        return res.sendStatus(401); //too many tries from the same ip
    else if(foundIp)
        foundIp.count++;
    else
        ips.push({ip, count: 1});

    var mailOptions = {
        from: 'Harley Support',
        to: 'harley.dis.sup@gmail.com',
        subject: req.query.subject,
        text: "Name\n" + req.query.name + "\n\nEmail\n" + req.query.email + "\n\nMessage\n" + req.query.message
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log("Error sending mail from " + req.query.name + "\n" + error);
            res.sendStatus(500);
        } else {
            console.log("Email from " + req.query.name + " sent.\n");
            res.sendStatus(200);
        }
    });  
});

app.get("/logs", function(req, res) {
    if(!req.query || req.query.pw != auth.password)
        return res.sendStatus(401);
    res.send(harley.log);
});

app.get("/restart", function(req, res) {
    if(!req.query || req.query.pw != auth.password)
        return res.sendStatus(401);
    if(req.query.hard){
        res.sendStatus(200);
        harley.dontsend=true;
        console.log("Harley hard restarted via api endpoint.");            
        harley.stop();
        setTimeout(() => {
            process.exit(1);
        },1000);
        return;
    }
    harley.dontsend = true;
    console.log("Harley restarted via api endpoint.");    
    harley.restart();
    res.sendStatus(200);
});

app.get("/stop", function(req, res) {
    if(!req.query || req.query.pw != auth.password)
        return res.sendStatus(401);
    harley.dontsend = true;
    harley.kill(true);
    console.log("Process killed via api endpoint.");
    res.sendStatus(200);
});

app.get("/pull", function(req, res) {
    if(!req.query || req.query.pw != auth.password)
        return res.sendStatus(401);
    Git.pull((err, update) => {
        if(err){
            res.sendStatus(500);
            console.log("Error pulling from api endpoint\n" + err);
        }
        console.log("Git Pull via api endpoint successfull.");
        res.send(update.summary);
    });
});

app.get("/sendStatus", function(req, res) {
    fetch("http://localhost:3000/status?extended=true").then(res => {
        if(res.status == 200){
            res.json().then(data => {
                io.emit('status', data);  
            });
            res.sendStatus(200);            
        }
        else {
            io.emit('status', {"status": "offline", "guilds": "N/A", "connections" : 0, "connlist" : new Array()});      
            res.sendStatus(500);
        }      
    }).catch(err => {
        res.sendStatus(500);
        io.emit('status', {"status": "offline", "guilds": "N/A", "connections" : 0, "connlist" : new Array()});        
    });
});

io.on("connection", socket => {
    socket.emit('logs', {"log": harley.log});
    fetch("http://localhost:3000/status?extended=true").then(res => {
        if(res.status == 200)
            res.json().then(data => {
                socket.emit('status', data);
            });
        else{ 
            socket.emit('status', {"status": "offline", "guilds": "N/A", "connections" : 0, "connlist" : new Array()}); 
        }           
    }).catch(err => {
        socket.emit('status', {"status": "offline", "guilds": "N/A", "connections" : 0, "connlist" : new Array()});      
    });
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
    io.emit('status', {"status": "offline", "guilds": "Unknown", "connections" : 0, "connlist" : new Array()});    
    if(harley.dontsend)
        return harley.dontsend = null;
    var mailOptions = {
        from: 'Harley Support',
        to: 'harley.dis.sup@gmail.com',
        subject: "Harley Crashed.",
        text: "Harley just crashed :c\n" + new Date().toLocaleString("en-US",{"timeZone" : "Australia/Melbourne"}) + "\n\n\nLogs:\n" + harley.log
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log("Error sending crash warning email\n" + error);
        } else {
            console.log("Crash warning email sent.\n");
        }
    }); 
});

harley.on("start", () => {
    setTimeout(() => {
        fetch("http://localhost:3000/status?extended=true").then(res => {
            if(res.status == 200)
                res.json().then(data => {
                    io.emit('status', data);                
                });
            else 
                io.emit('status', {"status": "offline", "guilds": "N/A", "connections" : 0, "connlist" : new Array()});            
        }).catch(err => {
            io.emit('status', {"status": "offline", "guilds": "N/A", "connections" : 0, "connlist" : new Array()});        
        });
    },10000);
});

harley.on("restart", () => {
    setTimeout(() => {
        fetch("http://localhost:3000/status?extended=true").then(res => {
            if(res.status == 200)
                res.json().then(data => {
                    io.emit('status', data);                
                });
            else 
                io.emit('status', {"status": "offline", "guilds": "N/A", "connections" : 0, "connlist" : new Array()});            
        }).catch(err => {
            io.emit('status', {"status": "offline", "guilds": "N/A", "connections" : 0, "connlist" : new Array()});        
        });
    },10000);
});

harley.on('stdout', data => {
    harley.log += data + "<br/>";
    io.emit('logs', {"log": harley.log});
});

harley.on("stderr", data => {
    harley.log += data + "<br/>";
    io.emit('logs', {"log": harley.log});
})
