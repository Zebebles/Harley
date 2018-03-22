const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");


module.exports = class UDefine extends DBF.Command{
    constructor(){
        super({
             name: "purge", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["prune", "purge"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Delete n messages from the channel, or all bot messages in the last n messages", //this will show in the help message
             example: ">>prune 10\n>>prune bot (defaults to last 75 messages)\n>>prune 10 bot",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs : true,
             reqUserPerms : ["MANAGE_MESSAGES"],
             reqBotPerms : ["MANAGE_MESSAGES"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;  
        if(!args.match(/\d+|bot/gi))
            return msg.channel.send("Please specify the number of messages you wish to prune.").then(m => m.delete(4000));
        let n = args.match(/\d+/g) ? parseInt(args.match(/\d+/g)) : 74;
        let bot = args.match(/bot/gi) ? true : false;
        n > 100 ? n = 100 : n = n;
        msg.delete(200).then(() => {
            msg.channel.fetchMessages({limit: n}).then(messages => {
                if(bot)
                    messages = messages.filter(m => m.author.bot || (m.content.match(/[a-zA-Z]?[!-)+-/:-@[-^{-}]{1,4}[a-zA-Z0-9]+/g) != null 
                                                                    ? m.content.indexOf(m.content.match(/[a-zA-Z]?[!-)+-/:-@[-^{-}]{1,4}[a-zA-Z0-9]+/g)[0]) == 0 : false));
                if(messages.size > 0)
                    msg.channel.bulkDelete(messages, true).then(deleted => {
                        if(bot)
                            msg.channel.send("Successfully removed `" + deleted.size + "` messages from the channel.").then(m => m.delete(2500));
                    }).catch(err => msg.channel.send("There was an error doing that ... You might have to delete them all manually :confounded:").then(m => m.delete(3000)));
            });
        });
    }
}