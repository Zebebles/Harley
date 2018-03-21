const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");
const Git = require("simple-git")(__dirname + "/../");
const fs = require("fs");

module.exports = class Pull extends DBF.Command{
    constructor(){
        super({
             name: "pull", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["pull"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             ownerOnly : true, //if this command is to be used by the bot creator only.
             description: "Pulls from git server", //this will show in the help message
             example: ">>pull",                          
             guildOnly : false //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
        });
    }
    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        Git.pull((err, update) => {
            if(err)
                return msg.channel.send("There was an error: ```" + err + "```");
            msg.channel.send("Pull successful!```" + update.summary.changes + "```");
        });
    }
}
