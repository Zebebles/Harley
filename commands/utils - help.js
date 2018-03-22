const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");


module.exports = class Help extends DBF.Command{
    constructor(){
        super({
             name: "help", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["help", "h"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Harley send a general help message, or a more specific help message if you include a command name/group.", //this will show in the help message
             example: ">>help\n>>help music\n>>help play",                          
             reqArgs : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        let embed = new Discord.RichEmbed();
        let prefix;
        if(msg.guild && msg.guild.prefix)
            prefix = msg.guild.prefix;
        else 
            prefix = msg.client.prefix;
        
        if(args && msg.client.commands.find(cmd => cmd.areYou(args.toLowerCase()))) //if they're looking for command specific help
            return msg.client.commands.find(cmd => cmd.areYou("commands")).run(params);
        else if(args && msg.client.commands.find(cmd => cmd.group.toLowerCase() == args.toLowerCase()))
            return msg.client.commands.find(cmd => cmd.areYou("commands")).run(params);
        else{ //if they're just looking for general help
            embed.setTitle("Information");
            embed.setColor([127, 161, 216]);
            embed.setDescription(
            "**Prefix:** `" + prefix + "` all commands should begin with the prefix.  e.g. `" + prefix + "help` or <@" + msg.client.user.id + "> help\n"
            + "**Developer:** <@" + msg.client.author + ">\n"
            + "**Website:** [Click here!](http://www.harleybot.me)\n"
            + "**Invite Harley:** " + "[Click here!](https://discordapp.com/oauth2/authorize?client_id=300828323443900416&scope=bot&permissions=305654848)" + "\n"
            + "**Support Server:** " + "[Click here!](https://discord.gg/Wy5AjGS)"
            + "\n**Commands:** You can find a list of commands on the [website](http://www.harleybot.me/commands), or with `" + prefix + "commands`");

            msg.channel.send("", {"embed": embed}).catch(err => console.log(err));
        }
    }
}