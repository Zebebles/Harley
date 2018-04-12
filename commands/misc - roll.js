const DBF = require('discordjs-bot-framework');

module.exports = class Choose extends DBF.Command{
    constructor(){
        super({
             name: "roll", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["dice"], //any message (excluding msg.client.msg.client.Prefix) that will trigger this command.
             group: "Misc", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Roll a really big dice (between 2 and 100000)", //this will show in the help message
             example: ">>roll 1000",             
			 guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
			 reqArgs: true
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        let num = 100;
        
        if(args && !isNaN(parseInt(args)) && parseInt(args) > 1)
            num = parseInt(args);

        if(num > 100000)
            num = 100000;
        
        let rolled = Math.floor(Math.random() * num)+1;

        msg.channel.send("I rolled `" + rolled + "`!").catch(err => console.log(err));
     }
}