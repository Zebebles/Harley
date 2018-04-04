const DBF = require('discordjs-bot-framework');

module.exports = class Question extends DBF.Command{
    constructor(){
        super({
             name: "question", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["8ball", "ask"], //any message (excluding msg.client.msg.client.Prefix) that will trigger this command.
             group: "Fun", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
			 description: "Ask Harley anything!", //this will show in the help message
			 example: ">>question are you the best bot?",			 
			 guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
			 reqArgs: true
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
		let msg = params.msg; let args = params.args; let user = params.user;
		if(!args)
			return msg.channel.send("You see the thing about questions is that you actually have to ask something... :wink:").catch(err => console.log(err));		
		let responses = ["Yes.", "No.", "Maybe.", "It seems so.", "Most likely.", "Probably.", "Unlikely.", "Probably not.", "No way!", "Definitely!"];
		var max = Math.floor(1);
		var ans = Math.floor(Math.random() * responses.length);
        msg.channel.send(":8ball: " + responses[ans]).catch(err => console.log(err));
     }
}