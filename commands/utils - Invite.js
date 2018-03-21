const DBF = require('discordjs-bot-framework');
const Discord = require('discord.js');

module.exports = class userinfo extends DBF.Command{
    constructor(){
        super({
             name: "Invite", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["inv", "links"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Get Harley's invite link", 
             example: ">>invite",                          
             guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs : false,
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        let serverInvite;
        let waitfor = (msg.guild && msg.guild.me.hasPermission("MANAGE_GUILD") && msg.guild.defaultRole.hasPermission("CREATE_INSTANT_INVITE"))
                    ? msg.guild.fetchInvites() 
                    : new Promise((resolve,reject) => resolve());
    
        let embed = new Discord.RichEmbed();
        if(msg.guild)
            embed.setColor(msg.guild.me.displayColor);
        embed.addField("Invite Harley", "[Click here!](https://discordapp.com/oauth2/authorize?client_id=300828323443900416&scope=bot&permissions=305654848)",true);
        embed.addField("Support Server", "[Click here!](https://discord.gg/Wy5AjGS)", true);
        embed.addField("Website", "[Click here!](http://www.harleybot.me)", true);
       
        waitfor.then(invites => {
            if(invites && invites.find(inv => !inv.temporary))
                serverInvite = invites.find(inv => !inv.temporary);
            else if(invites && invites.size > 0)
                serverInvite = invites.first();
            if(serverInvite)
                embed.addField("This Server", "[Click here!](" + serverInvite.url + ")", true);
            
            msg.channel.send("", {"embed": embed});
        }).catch(() => {
            msg.channel.send("", {"embed": embed});
        });
    }
}