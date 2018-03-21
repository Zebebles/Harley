const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class Puppy extends DBF.Command{
    constructor(){
        super({
             name: "insult", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["roast", "insult", "bully"], //any message (excluding prefix) that will trigger this command.
             group: "Fun", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Let Harley roast someone.", //this will show in the help message
             example: ">>roast @user\n>>roast username",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqUser : true
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        let insult = "";
        if(user)
            insult = "<@" + user.id + ">, ";
        else
            return msg.channel.send("I can't spit fire at no-one :c. Make sure you include an @mention or username of the person you want me to roast.")
        
        insult += require("insult-compliment").Insult();
        msg.channel.send(insult);
    }
}