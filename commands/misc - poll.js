const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class Hello extends DBF.Command{
    constructor(){
        super({
             name: "poll", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["poll", "vote"], //any message (excluding prefix) that will trigger this command.
             group: "Misc", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Emoji poll!", //this will show in the help message
             example: ">>poll option 1, option 2, option 3",             
             guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs : true,
             reqBotPerms: ["MANAGE_MESSAGES", "ADD_REACTIONS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let myEmbed = new Discord.RichEmbed();
        let msg = params.msg; let args = params.args; let user = params.user;
        if(!args || args == "") return msg.channel.send("Usage: `poll opt1,opt2,opt3`");
        
        let options = args.match(/[\w\d \'\-\_\"]*/g).filter(s => s != "");
        
        if(options.length < 2) return msg.channel.send("There must be at least 2 poll options.");
        if(options.length > 7) return msg.channel.send("There is a maxiumum of 7 options allowed, sorry.");
        let reaccs = [{emoji: "♥",name: "heart"},{emoji: "💩", name: "poop"},{emoji: "🤔",name: "thinking"},{emoji: "🤷", name: "shrug"},{emoji: "🔥", name: "fire"},{emoji:"🤖", name: "robot"},{emoji: "😍", name: "heart_eyes"}];
        myEmbed.setTitle("A poll has begun!  You all have 60 seconds to vote");
        myEmbed.setColor([255,0,0]);
        let message = "";
        let nOptions = new Array();
        for(let i = 0; i < options.length; i++)
            nOptions.push({opt: options[i], react: reaccs[i], count: 0});

        options = nOptions;
        
        for(let i = 0; i < options.length; i++)
            message += "\n" + options[i].react.emoji + " - `" + options[i].opt + "`";
        myEmbed.setDescription(message);
        msg.channel.send("", {"embed": myEmbed}).then( voteMessage => {
            let results = new Array();
            
            for(let i = 0; i < options.length; i++)
                voteMessage.react(options[i].react.emoji);

            const filter = (r, u) => !u.bot && options.find(o => r.emoji.name == o.react.emoji);
            let collector = new Discord.ReactionCollector(voteMessage, filter);

            setTimeout( () => {
                let collected = collector.collected.array();
                collector.stop();
                options.forEach(opt => opt.count = collected.find(r => r.emoji.name == opt.react.emoji) ? collected.find(r => r.emoji.name == opt.react.emoji).count-1 : 0);
                message = ""
                options.sort(function(a,b) { return b.count - a.count});                
                options.forEach(op => message += "\n" + op.react.emoji + " - `" + op.opt + "` got `" + op.count + "` votes.");
                myEmbed.setColor([0,255,0]);
                myEmbed.setTitle("Vote ended!");
                myEmbed.setDescription(message);
                voteMessage.edit("", {"embed": myEmbed});
                voteMessage.clearReactions();
            },60000);
        });
    }
}
