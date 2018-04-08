const DBF = require('discordjs-bot-framework');
const math = require('mathjs');

module.exports = class Solve extends DBF.Command{
    constructor(){
        super({
             name: "solve", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["math"], //any message (excluding msg.client.msg.client.Prefix) that will trigger this command.
             group: "Misc", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Let Harley solve math equations for you.", //this will show in the help message
             example: ">>solve equations_split_by_comma\n>>solve 9+10\n>>solve 9+10, 10+11",             
			 guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
			 reqArgs: true
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        let prefix = msg.guild && msg.guild.prefix ? msg.guild.prefix : msg.client.prefix;
        if(!args)
            return msg.channel.send("Usage: `" + prefix +"solve 9+10`.\nUse `" + msg.guild.prefix + "commands solve` for more examples.");
        
        try{
            let qs = args.split(/[,:;]/g) ? args.split(/[,:;]/g) : [args];
            let message = "";
            qs.forEach(question => {
                message += "\n`" + question + "`\t=\t`" + math.eval(question) + "`";
            })
            msg.channel.send(`**Here's what I got**${message}`);
        }catch(err){
            msg.channel.send("Sorry, I was unable to solve that for you.");
        }
     }
}