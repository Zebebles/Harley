const DBF = require('discordjs-bot-framework');
const http = require("https");
const Discord = require("discord.js");

module.exports = class ImgSearch extends DBF.Command{
    constructor(){
        super({
             name: "image", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["image", "img"], //any message (excluding msg.client.msg.client.Prefix) that will trigger this command.
             group: "Misc", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
			 description: "Google image searces a query and sends result in chat.", //this will show in the help message
			 example: ">>image meme",			 
			 guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
			 reqArgs: true,
			 reqBotPerms : ["EMBED_LINKS"],
			 reqUserPerms : ["ATTACH_FILES"]
        });
    }

	run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
		
		let blacklisted = require("../resources/blacklist.json").words;
		let msg = params.msg; let args = params.args; let user = params.user;
		let searchquery = args;
		searchquery = encodeURI(searchquery);
		var body = "";
		let nsfw = false;		
		if(!msg.channel.nsfw){
			let query = searchquery.replace(/\s/g, '');
			blacklisted.forEach(word => {
				if(query.includes(word))
					return nsfw = true;
			});
			if(nsfw)
				return msg.channel.send("That search query has been flagged as NSFW. Use an NSFW channel if you want to search for NSFW content.");
		}		
		http.get({
			host: "www.googleapis.com",
			path: "/customsearch/v1?key="+msg.client.auth.googleKey + "&cx=013774790275612872185:1gwwruxm81m&searchType=image&q=" + searchquery
		}, response => {
			response.on('data', d => {
				body += d;
			})
			response.on('end', function (){ 
				var parsed = JSON.parse(body);
				var num;
				if(parsed.error != null) return msg.channel.send("There was an error! May be out of free API quota");
				if(parsed.items == null) return msg.channel.send("No image found.");
				if(parsed.items.length == 0) return msg.channel.send("No image found.");
				var good = false;
				var ttl = 20;
				while(!good){
					num = Math.floor(Math.random() * (19 - 0 + 1)) + 0;
					if(parsed.items[num] != null) good = true;
					ttl --;
					if(ttl == 0) return msg.channel.send("No img found :c");
				}
				if(parsed.items[num].link == null) return msg.channel.send("No img found");
				let msgembed = new Discord.RichEmbed();
				if(msg.guild)
            		msgembed.setColor(msg.guild.me.displayColor);
        		else
					msgembed.setColor([127, 161, 216]);				
				msgembed.setImage(parsed.items[num].link);
				msg.channel.send("", {"embed" : msgembed});
			})
		});
    }
}