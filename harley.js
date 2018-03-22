const myClient = require("./classes/client.js");
let auth = require("./resources/auth.json");
const Playlist = require("./classes/playlist.js");
const SC = require("node-soundcloud");
const spotify = require("spotify-web-api-node");
let snekfetch = require("snekfetch");
const fs = require('fs');
const fetch = require("node-fetch");
const express = require("express");
const Discord = require("discord.js");
require("./unlisted/streaming.js")();
require("./unlisted/joinleave.js")();//

snekfetch.get("http://"+auth.webserver+"/servers/register?pw=" + auth.password).then(response => {
    if(response.status != 200)
        return console.log("Error registering server");
    
    snekfetch.get("http://"+auth.webserver + "/servers/auth").then(authResponse => {
        
        if(authResponse.status != 200)
            return console.log("Error fetching auth.");
        
        auth = JSON.parse(authResponse.text);
        delete response, authResponse;
        
        let bot = new myClient({
            author: "221568707141435393", //this is used to check if the message was sent by the bot creator for ownerOnly commands
            prefix: ">>", //this is used as the prefix for any command your bot will respond to.  The bot will also respont to @mentions followed by command triggers.
            cmddir: require('path').join(__dirname, 'commands'), //this is the directory of your command folder.
            token: auth.mildredtoken, //this is your bots token.  It is used to log in as the client, and hence, should not be shared.
            MentionsTrigger: true
        });
        bot.auth = auth;
        /*
            Listen on port 3000 for API requests.
            Allow access from any IP / host.
        */
        bot.express = express();
        bot.express.use(function(req, res, next)
        {
            res.header('Access-Control-Allow-Origin', "*");
            if(req.ip == "::ffff:" + auth.webserver.split(":")[0] || req.ip == "::1")//if the request is from localhost or webserver
            {
                next();
            }
            else
                res.sendStatus(401);    //send an unauthorised error.
        });

        bot.express.listen(3003);

        /*
            Authorise the soundcloud API
        */
        SC.init({
            id: auth.scID,
            secret: auth.scSecret,
            uri: 'http://soundcloud.com',
        });

        /*
            Catch missing permission events
        */

        bot.on("missingPermissions", data => {
            if(data.bot)
                data.message.channel.send("I need permission `" + data.permissions[0] + "` to be able to that.");
            else
                data.message.channel.send("You need permission `" + data.permissions[0] + "` if you want me to do that." )
        });

        bot.on("ownerCommandTried", (command,msg) => {
            msg.channel.send("The command `" + command.name + "` is only avaliable for my developers.")
        });

        bot.on("commandError", data => {
            console.log("Error running command " + data.command.name + "in " + data.message.guild.name + "\n" + data.error);
        }); 

        bot.on("ready", () =>{
            /*
                load guild prefixes, default roles, disabled commands, and greetings/farewells.
            */
            bot.loadGuilds(bot);
            bot.loadUsers(bot);
            bot.sendStatus(false,true);
            /*
                Instantiate playlists in all the guilds.
            */
            bot.guilds.forEach(g => 
                g.playlist = new Playlist(g));

            /*
                Authorize the spotify oauth2 client.
            */
            bot.spotify = new spotify({
                clientId: auth.spotifyId,
                clientSecret: auth.spotifySecret
            });
            bot.spotify.clientCredentialsGrant().then(data => {
                bot.spotify.expiry = Date.now() + data.body['expires_in'];
                bot.spotify.setAccessToken(data.body['access_token']);
            });

            bot.user.setPresence({game : {name: bot.prefix + "help"}});
            /*
                Update the commands list for the website to read from.
            */
            bot.commandsList = new Array();
            bot.commands.filter(cmd => !cmd.ownerOnly).forEach(cmd => {
                let aliases = "";
                cmd.triggers.forEach(t => aliases += t + ", ");
                aliases = aliases.replace(cmd.name + ",", "").trim();
                if(aliases == "")
                    aliases = "N/A";
                else
                    aliases = aliases.substr(0, aliases.length-1);
                bot.commandsList.push({"name": cmd.name, "group": cmd.group, "aliases" : aliases , "description": cmd.description, "example": cmd.example})
            });
            fs.writeFile("/var/www/html/harleybot.me/public_html/resources/commands_list.json", JSON.stringify(bot.commandsList), err => {
                if(err)
                    return console.log(err)
                console.log("Website commands list updated!");
            });
            snekfetch.post("http://" + both.auth.webserver + "/servers/commands")
            .send({commands: bot.commandsList})
            .end();

        });

        bot.on('commandsReloaded', () => {
            bot.commandsList = [];
            bot.commands.filter(cmd => !cmd.ownerOnly).forEach(cmd => {
                let aliases = "";
                cmd.triggers.forEach(t => aliases += t + ", ");
                aliases = aliases.replace(cmd.name + ",", "").trim();
                if(aliases == "")
                    aliases = "N/A";
                else
                    aliases = aliases.substr(0, aliases.length-1);
                bot.commandsList.push({"name": cmd.name, "group": cmd.group, "aliases" : aliases , "description": cmd.description, "example": cmd.example})
            });
            snekfetch.post("http://" + both.auth.webserver + "/servers/commands")
            .send({commands: bot.commandsList})
            .end();
        });

        /*
            if there's a stream announcement channel and a members presence is updated.
        */
        bot.on("presenceUpdate", (old, updated) => {
            if(updated.guild.channels.filter(ch => ch.type == "text" && ch.topic).find(ch => ch.topic.toLowerCase().includes(updated.guild.prefix + "stream")))
                setTimeout( () => announceStream(old, updated),2000);
        });

        bot.login();

        /*
            An API endpoint that takes a guild and channel ID and returns the channel name
        */
        bot.express.get("/channel", function(req, res){
            if(!bot || bot.status != 0)
                return res.sendStatus(500);

            var guild = bot.guilds.get(req.query.g);
            if(!guild)
                return res.sendStatus(400);
            var channel = guild.channels.get(req.query.c);
            if(!channel)
                return res.sendStatus(400);
            res.send(channel.name);
        });

        /*
            an API endpoint that takes a password and a cmd name/group
            and reloads the commands that come under that name/group.
        */
        bot.express.get("/reload", function(req, res){
            res.send(bot.reloadCommands(req.query.cmd) + " commands");
        });

        /*
            An API endpoint that takes a guild and role ID and returns the role name
        */
        bot.express.get("/role", function(req, res){
            if(!bot || bot.status != 0)
                return res.sendStatus(500);

            var guild = bot.guilds.get(req.query.g);
            if(!guild)
                return res.sendStatus(400);
            var role = guild.roles.get(req.query.r);
            if(!role)
                return res.sendStatus(400);
            res.send(role.name);
        });

        //just to see if the bot's alive.
        bot.express.get("/alive", function(req,res)
        {
            res.sendStatus(200);
        });
    }).catch(err => console.log("Error getting authentication\n"+err))
}).catch(err => console.log("Failed registering server.\n"+err));

