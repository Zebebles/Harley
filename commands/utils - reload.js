const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");
const snekfetch = require("snekfetch")

module.exports = class Restart extends DBF.Command{
    constructor(){
        super({
             name: "reload", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["refresh"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             ownerOnly : true, //if this command is to be used by the bot creator only.
             description: "Reloads specified command or group of commands", //this will show in the help message
             example: ">>reload utils\n>>reload play",             
             guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs: true,
        });
    }
    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        snekfetch.get("https://"+msg.client.auth.webserver+"/manage/reload?pw="+msg.client.auth.password+"&cmd="+args).then(r => {
            msg.channel.send("Reloaded `" + r.text + "` under `" + args + "` on all servers.");                           
        }).catch(err => console.log(err));
    }
}
