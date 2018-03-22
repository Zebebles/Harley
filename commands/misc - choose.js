const DBF = require('discordjs-bot-framework');

module.exports = class Choose extends DBF.Command{
    constructor(){
        super({
             name: "choose", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["choose", "chose", "chooose", "ch"], //any message (excluding msg.client.msg.client.Prefix) that will trigger this command.
             group: "Misc", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Let Harley choose one of x options.", //this will show in the help message
             example: ">>choose option 1, option 2, option 3",             
			 guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
			 reqArgs: true
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        if(!args || args == "") return msg.channel.send("Usage: `" + msg.guild.prefix + "choose opt1,opt2,opt3`").catch(err => console.log(err));
        let opts = args.match(/[\w\d \'\"\-\_]*/g).filter(s => s != "");
        if(opts.length < 2) return msg.channel.send("Usage: `" + msg.guild.prefix + "choose opt1,opt2,opt3`").catch(err => console.log(err));
		var min = Math.ceil(0);
		var max = Math.floor(opts.length-1);
		var choice = Math.floor(Math.random() * (max - min+1)) + min;
        msg.channel.send("I choose `" + opts[choice] + "`").catch(err => console.log(err));
     }
}