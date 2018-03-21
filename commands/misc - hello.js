const DBF = require('discordjs-bot-framework');

module.exports = class Hello extends DBF.Command{
    constructor(){
        super({
             name: "hello", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["hi", "hello", "hey", "howdy", "gday", "g'day"], //any message (excluding prefix) that will trigger this command.
             group: "Fun", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Sends hello in the channel along with Harley's ping", //this will show in the help message
             example: ">>hello",             
             guildOnly : false //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        msg.channel.send("Hello! - `" + msg.client.ping.toFixed(2) + "ms`");
    }
}