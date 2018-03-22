const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");
const fs = require("fs");

module.exports = class Screenshot extends DBF.Command{
    constructor(){
        super({
             name: "screenshots", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["screenshot", "ss"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Fun", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
			 description: "Sends a random screenshot of someone [BLACKLISTED ON MOST SERVERS]", //this will show in the help message
			 example: ">>screenshot name\n>>screenshot add name imgur_link",			 
			 guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
			 reqArgs: true,
			 reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
		let msg = params.msg; let args = params.args; let user = params.user;
 	    function CheckSubject(name, imgSubject){
            var found;
		    found = false;
		    if(name == imgSubject){
		    	found = true;
		    }else{
		    	found = false;
	    	}
		    return found;
        }

        var found = false;
		let msgembed = new Discord.RichEmbed();
        if(msg.guild)
			msgembed.setColor(msg.guild.me.displayColor);
		else
			msgembed.setColor([127, 161, 216]);//sarahs                  greens                                   ethans                                  amys                
		if((msg.guild.id == '288572683874992130'|| msg.guild.id == "317548490928422912" || msg.guild.id == "333891597915783168" || msg.guild.id == "381440425145270287") ) {
			var entries = JSON.parse(fs.readFileSync('resources/imgs.json', 'utf8'));
			if(!args) args = "";
			
			while(!found){
				var min = Math.ceil(0);
				var max = Math.floor(entries.length);
				var imgnum = Math.floor(Math.random() * (max-min)) + min;
				
				if(args.match(/add .[^ ]* (http:\/\/i|https:\/\/i|i)(\.imgur.com\/|mgur.com\/)/g)){
					found = true;					
					if(!msg.member.hasPermission(128)) return msg.channel.send("You need to be able to view audit logs to use that.");
					if(!args.match(/(jpeg|png|jpg)/g)) return msg.channel.send("Link must be a .png or .jpg");
					let nameToAdd = args.split(" ")[1];
					let linkToAdd = args.split(" ")[2];
					entries.push({"name" : nameToAdd, "link": linkToAdd});

					fs.writeFile( "resources/imgs.json", JSON.stringify( entries ), "utf8", (err) => {
						if(err) throw err;
					});        ;
					return msg.channel.send("Photo added!").catch(err => console.log(err));
				}
				else if(args == ""){
					msgembed.setTitle(entries[imgnum].name);
					msgembed.setImage(entries[imgnum].link);
					found = true;
					msg.channel.send("", {"embed": msgembed}).catch(err => console.log(err));
				}
				else if(entries[imgnum].name.toLowerCase() == args.toLowerCase()){
					msgembed.setTitle(entries[imgnum].name);
					msgembed.setImage(entries[imgnum].link);
					found = true;
					msg.channel.send("", {"embed": msgembed}).catch(err => console.log(err));					
				}
				else if(args.toLowerCase().trim() == "amy"){
					var voiceCh = msg.member.voiceChannel;					
					if(!(voiceCh))
						return;
					else if (!(voiceCh.joinable))
						return;
					else{ //voice channel exists, and is joinable
						voiceCh.join().then(connection => {
							var disp = connection.playFile('/root/Harley/resources/hey_f_off.mp3');
							disp.on("end", () => connection.disconnect())
						}).catch(err => console.log(err));
						found = true;											
					}
					msgembed.setImage("https://i.imgur.com/VIJZXJj.jpg");
					msg.channel.send("", {"embed": msgembed}).catch(err => console.log(err));
				}
				else if(!entries.find(e => e.name.toLowerCase() == args.toLowerCase().trim())){
					found = true;
					msg.channel.send("Can't find any images under `" + args + "`").catch(err => console.log(err));
				}
			}
		}else{
		  msg.channel.send('This server needs to be whitelisted for that command.').catch(err => console.log(err));
		}
    }
}