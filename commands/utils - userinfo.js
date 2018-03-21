const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class userinfo extends DBF.Command{
    constructor(){
        super({
             name: "userinfo", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["info", "uinfo", "uinf", "user", "inf"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
			 description: "Shows some information about the mentioned user.", //this will show in the help message
			 example: ">>info @user\n>>info username",			 
			 guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
			 reqUser: true,
			 reqArgs: true,
			 reqBotPerms: ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
		let msg = params.msg; let args = params.args; let user = params.user;
		args += "";
		if(!user && args && (msg.mentions.roles.first() || msg.guild.roles.find(r => r.name.toLowerCase().includes(args.toLowerCase().trim())))) 
			return msg.client.commands.find(cmd => cmd.areYou("roleinfo")).run(params);
		if( !params.args || params.args == "")
			user = msg.author;
		else if(!user)
			 return msg.channel.send("No server member or role found.");
		
		let mem = msg.guild.members.get(user.id);
		let id = user.id;
		let displayname = mem.displayName;
		let avatar = user.displayAvatarURL;
		let username = user.username;
		let bot = user.bot;
		if(bot)
			bot = "✓";
		else
			bot = "❌"
		let descrim = user.discriminator;
		let now = new Date();
		let datejoined = mem.joinedAt;

		let highestrole = mem.highestRole;
		
		if(displayname != username)
			id = "`<@!" + id + ">`";
		else
			id = "`<@" + id + ">`";	

		let membertime = getTimeString(datejoined);
		let discordTime = getTimeString(mem.user.createdAt);
		let myembed = new Discord.RichEmbed();
		
		myembed.setThumbnail(avatar);
		myembed.setColor(mem.displayColor);
		myembed.setURL(msg.author.displayAvatarURL);
		myembed.setAuthor(displayname + "#"+descrim, msg.author.displayAvatarURL);
		if(displayname != username)
			myembed.setAuthor(username + "#"+descrim + " (" + displayname + ")", msg.author.displayAvatarURL);
		myembed.addField("ID", id);
		myembed.addField("Bot", bot, true);
		msg.author.rep != null ? myembed.addField("Rice", msg.author.rep,true) : null;
		myembed.addField("Joined Discord", discordTime);
		myembed.addField("Joined server", membertime);
		myembed.addField("Highest role", highestrole);

		msg.channel.send("", {"embed":myembed});

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