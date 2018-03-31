const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class ServerInfo extends DBF.Command{
    constructor(){
        super({
             name: "server", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["serverinfo","guild", "guildinfo"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Showns some information about the server.", //this will show in the help message
             example: ">>server",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;

        //DEFINE FEILDS
        let now = Date.now();
        let numMembers = msg.guild.members.filter(m => !m.user.bot).size;
        let numBots = msg.guild.members.filter(m => m.user.bot).size;
        let created = getTimeString(msg.guild.createdAt);
        let customEmojis = msg.guild.emojis.size;
        let nChannels = msg.guild.channels.size;
        let nRoles = msg.guild.roles.size;
        let region = msg.guild.region;
        let owner = msg.guild.owner.user;

        //BUILD EMBED
        let embed = new Discord.RichEmbed;
        embed.setColor(msg.guild.me.displayColor);
        embed.setAuthor(msg.guild.name + ` ( ${msg.guild.id} )`, msg.guild.iconURL);
        embed.addField("Members", numMembers,true);
        embed.addField("Bots", numBots,true);
        embed.addField("Channels", nChannels, true);
        embed.addField("Roles", nRoles, true);
        embed.addField("Custom Emojis", customEmojis,true);
        embed.addField("Created", created);
        embed.addField("Owner", owner);
        msg.channel.send("", {"embed":  embed}).catch(err => console.log(err));

        //TURNS MILLISECONDS INTO DAYS HOURS MINUTES SECONDS
        function getTimeString(current){
			var delta = Math.abs(now - current) / 1000;
			var days = Math.floor(delta / 86400);
			delta -= days * 86400;
			var hours = Math.floor(delta / 3600) % 24;
			delta -= hours * 3600;
			var minutes = Math.floor(delta / 60) % 60;
			delta -= minutes * 60;
			var seconds = Math.round(delta % 60);			

			return "**"+ days + "** days **" + hours + "** hours **" + minutes + "** minutes and **" + seconds + "** seconds ago";
		}
    }
}