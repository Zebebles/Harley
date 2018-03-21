const DBF = require('discordjs-bot-framework');

module.exports = class saySomething extends DBF.Command{
    constructor(){
        super({
             name: "say", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["speak", "talk"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Make Harley say something (Admin only).", //this will show in the help message
             example: ">>say Hello!",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs: true
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        if ((msg.member.hasPermission("ADMINISTRATOR")) || (msg.author.id === msg.client.author) || (msg.author.id == msg.guild.ownerID)){
            let message = args;
            if(message == "" || !message) return;
            msg.channel.send(message);
			msg.delete();
		}
    }
}