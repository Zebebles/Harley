const DBF = require('discordjs-bot-framework');

module.exports = class changeGame extends DBF.Command{
    constructor(){
        super({
             name: "changegame", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["game", "setgame", "setplaying"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             ownerOnly : true, //if this command is to be used by the bot creator only.
             description: "Client changes what game its playing.", //this will show in the help message
             example: ">>game >>help",             
             guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs: true
        });
    }

    run(params = {"msg": msg, "args": args, "user" : user}){ //all the code for your command goes in here.
        var game = "";
        let msg = params.msg; let args = params.args;
        if(!args) return;
        msg.client.user.setPresence({game : {name : args, type: 0}});
		msg.channel.send("Ok!");	
    }
}