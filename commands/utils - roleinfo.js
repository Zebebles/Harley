const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class userinfo extends DBF.Command{
    constructor(){
        super({
             name: "roleinfo", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["roleinfo", "role", "roleinf", "rinfo"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Displays some information about specified role", //this will show in the help message
             example: ">>role role_name",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs : true,
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        let role;
        args += "";
        //GET THE ROLE
        if(!msg.mentions.roles.first())
            role = msg.guild.roles.find(r => r.name.toLowerCase().includes(args.toLowerCase().trim()));
        else
            role = msg.mentions.roles.first(); 
        //END GET THE ROLE
        if(!role)
            return msg.channel.send("Usage: `roleinfo @role or role_name`").catch(err => console.log(err));

        //declare info variables
        let roleName = role.name;
        let now = Date.now();
        let roleID = "`<@&" + role.id + ">`";
        let roleColor = role.hexColor;
        let position = msg.guild.roles.array().length - role.calculatedPosition;
        let created = getTimeString(role.createdAt);
        msg.guild.fetchMembers().then(function(guild) {
            let myEmbed = new Discord.RichEmbed();
            let memCount = guild.members.array().filter(m =>  m.roles.find(r => r == role)).length;
            myEmbed.setColor(role.color);
            myEmbed.setTitle(roleName);
            myEmbed.addField("ID", "`" + roleID + "`");
            myEmbed.addField("Color", roleColor.toUpperCase());
            myEmbed.addField("Members", memCount,true);
            myEmbed.addField("Position", position,true);
            myEmbed.addField("Created",created);
            msg.channel.send("", {embed: myEmbed}).catch(err => console.log(err));
        }).catch(err => console.log(err));

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