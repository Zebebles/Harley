const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class Thinking extends DBF.Command{
    constructor(){
        super({
             name: "thinking", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["thinking", "think", "thnk"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Fun", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Thinking emoji!", //this will show in the help message
             example: ">>thinking",             
             guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;        
        let msgembed = new Discord.RichEmbed();
		msgembed.setColor([255, 212, 71]);
		msgembed.setImage('http://i.imgur.com/86HXb8i.png');
		msg.channel.send(':thinking:', {"embed" : msgembed});
    }
}