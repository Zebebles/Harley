const DBF = require('discordjs-bot-framework');
const uDictionary = require("urban");
const Discord = require("discord.js");


module.exports = class UDefine extends DBF.Command{
    constructor(){
        super({
             name: "urban", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["udefine", "udef"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Misc", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
			 description: "Look up a word or phrase in the Urban Dictionary", //this will show in the help message
			 example: ">>urban whomst",			 
			 guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
			 reqArgs : true,
			 reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
		let msg = params.msg; let args = params.args; let user = params.user;
		let rand = false;
		let word = args;
		if (word == "" || word == null){
			rand = true;
			word = "ran";
		}
		let def = "";
		if(!(word.match(/[a-zA-Z]/g))) return msg.channel.send("That isn't a word!").catch(err => console.log(err));
		if(rand){
			uDictionary.random().first(res => {
				if (res == null) return msg.channel.send("Word not found.");
				word = res.word;
				def = res.definition + "*\n\n**Example**\n\t*" + res.example+"*";
				if((def.length + word.length + 40) > 2048) def = "Definition too long for message*\n\t"+ res.permalink;
				let myembed = new Discord.RichEmbed();
				if(msg.guild)
            		myembed.setColor(msg.guild.me.displayColor);
        		else
					myembed.setColor([127, 161, 216]);
				myembed.setDescription("**Word**\n*"
							+ word + "*"
							+ "\n\n**Definition**\n*"
							+ def);
				msg.channel.send("", {"embed":  myembed}).catch(err => console.log(err));
			});
		}else{
			uDictionary(word).first(res => {
				if (res == null) return msg.channel.send("Word not found.");
				word = res.word;
				def = res.definition + "*\n\n**Example**\n*" + res.example+"*";
				if((def.length + word.length + 40) > 2048) def = "Definition too long for message*\n"+ res.permalink;
				let myembed = new Discord.RichEmbed();
				if(msg.guild)
            		myembed.setColor(msg.guild.me.displayColor);
        		else
					myembed.setColor([127, 161, 216]);				
				myembed.setDescription("**Word**\n*"
							+ word + "*"
							+ "\n\n**Definition**\n*"
							+ def);
				msg.channel.send("", {"embed":  myembed}).catch(err => console.log(err));
			});
		}
    }
}