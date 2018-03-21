const DBF = require('discordjs-bot-framework');

module.exports = class Sexiness extends DBF.Command{
    constructor(){
        super({
             name: "sexiness", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["sexiness", "sexy"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Fun", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
			 description: "Detects a users sexiness.", //this will show in the help message
			 example: ">>sexiness @user\n>>sexiness username",			 
			 guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
			 reqUser: true
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
		let msg = params.msg; let args = params.args; let user = params.user;
		if(!user)
			user = msg.author;
		if(!user) 
			return msg.channel.send("Couldn't find anyone under `" + args + "`");
		let name = user.username;
		let sexiness = 0;
		var charcodetotal = 0;
		for(let i = 0; i < name.length; i++)
			charcodetotal += name.charCodeAt(i);

		sexiness = Math.ceil(((charcodetotal * Math.random())/charcodetotal) * 100);
		var emoji;
		if(sexiness < 12)
			emoji = ":scream:";
		else if(sexiness < 25)
			emoji = ":joy:";
		else if(sexiness < 50)
			emoji = ":grimacing:";
		else if(sexiness < 65)
			emoji = ":smirk:";
		else if(sexiness < 75)
			emoji = ":kissing_heart:";
		else
			emoji = ":heart_eyes:";
		msg.channel.send(user + ', your sexiness has been calculated, our results show that you\'re `' + sexiness + '%` sexy. ' + emoji);
    }
}