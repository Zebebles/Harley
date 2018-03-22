const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class Getav extends DBF.Command{
    constructor(){
        super({
             name: "avatar", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["avatar", "av"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Misc", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Sends an enlarged version of the users avatar", //this will show in the help message
             example: ">>avatar @user\n>>avatar username",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqUser: true,
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
		let msg = params.msg; let args = params.args; let mem = params.user;
        if(!mem)
            mem = msg.author;
        if(mem == null) return console.log("User not found");
        mem = msg.guild.members.get(mem.id);
		let avatar = mem.user.displayAvatarURL;
		let msgembed = new Discord.RichEmbed();
		msgembed.setColor(msg.guild.me.displayColor);
        msgembed.setImage(avatar);
		msg.channel.send("**" + mem.user.username + "**'s avatar", {"embed" : msgembed}).catch(err => console.log(err));
    }
}