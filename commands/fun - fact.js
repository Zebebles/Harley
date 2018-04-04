const DBF = require('discordjs-bot-framework');
let fact = require("random-fact");

module.exports = class Thinking extends DBF.Command{
    constructor(){
        super({
             name: "fact", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["randomfact", "funfact"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Fun", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Have a yearning for more useless information? Take your pick of over 3000 fun facts!", //this will show in the help message
             example: ">>fact",             
             guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;       
        let fact = fact();
        console.log(fact);
		msg.channel.send("hi").catch(err => console.log(err));
    }
}