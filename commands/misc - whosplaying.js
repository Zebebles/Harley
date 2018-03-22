const DBF = require('discordjs-bot-framework');
const Discord = require('discord.js');

module.exports = class WhosPlaying extends DBF.Command{
    constructor(){
        super({
             name: "whosplaying", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["playing", "whosplaying", "plyn"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Misc", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
			 description: "Lists all users playing specified game.", //this will show in the help message
			 example: ">>playing counter-strike",			 
			 guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
			 reqArgs: true,
			 reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
		let myEmbed = new Discord.RichEmbed();
		let msg = params.msg; let args = params.args; let user = params.user;
		myEmbed.setColor(msg.guild.me.displayColor);		
		let guild = msg.guild;
		let game = args;
		if(!game) return msg.channel.send("Game must be over 2 characters long.").catch(err => console.log(err));
		let members = guild.members.array().filter(m => !m.user.bot);
		let result = [];
		let gameIndex = [];
		let games = [];
		let found = false;

		if(game.length >= 3 ){

			for(let i = 0; i < members.length; i++){
					if (members[i].presence.game){
						let playing = members[i].presence.game.name + "";
						if(playing.toLowerCase().indexOf(game.toLowerCase() + "") > -1){
							result.push(members[i].user);
							for(let g = 0; g < games.length; g++){
								if(playing.toLowerCase() == games[g].toLowerCase()){
									gameIndex.push(g);
									found = true;
									break;
								}
							}//end for
							if(!found){
								games.push(playing);
								gameIndex.push(games.length-1);
							}else{
								found = false;
							}
						}//end if
					}
			}//end for
			if (result.length == 0)
				return msg.channel.send("No ones playing games with the tag `" + game + "`.").catch(err => console.log(err));

			myEmbed.setTitle("People currently playing games with the tag `" + game + "`");
			let message = "";
			for(let i = 0; i < games.length; i++){
				message += "\n\n **" + games[i]+"**";
				for(let p = 0; p < result.length; p++){
					if (gameIndex[p] == i){
						message += "\n\t • `" + result[p].username + "`";
					}
				}
			}

			try{
				myEmbed.setDescription(message);
			}catch(e){
				msg.channel.send("Too many people are playing games with the tag **" + game + "** to send in one message.").catch(err => console.log(err));
			}finally{
				msg.channel.send("", {"embed":  myEmbed}).catch(err => console.log(err));
			}
		}else{
			msg.channel.send("Game must be 3 characters or more.");
		}
	}
}