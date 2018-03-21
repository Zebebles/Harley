const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class Daily extends DBF.Command{
    constructor(){
        super({
             name: "daily", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["ration"], //any message (excluding prefix) that will trigger this command.
             group: "Economy", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Claim your daily ration of rice.", //this will show in the help message
             example: ">>daily",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel. This prevents that.
             reqArgs: true,
             reqUser: true,
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        
        if(!msg.author.repRefresh || msg.author.repRefresh <= new Date().getTime()){
            let rep = Math.floor(Math.random() * 100) + 1;
            if(!msg.author.rep)
                msg.author.rep = 0;
            msg.author.rep += rep;
            msg.author.repRefresh = new Date().getTime() + 86400000;
            msg.client.syncUser(msg.author);
            return msg.reply("You received `" + rep + "` grains of rice in your daily ration.");                
        }else
            return msg.reply("You've already recieved your ration.  Come back in " + getTimeString(msg.author.repRefresh));                ;
        
        function getTimeString(time){
            var delta = (time - new Date().getTime())/1000;
            var hours = Math.floor(delta / 3600) % 24;
            delta -= hours * 3600;
            var minutes = Math.floor(delta / 60) % 60;
            delta -= minutes * 60;
            var seconds = Math.round(delta % 60);			
    
            return "**"+ hours + "** hours **" + minutes + "** minutes and **" + seconds + "** seconds";
        }
    }
}