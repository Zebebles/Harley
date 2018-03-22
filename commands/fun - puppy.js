const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class Puppy extends DBF.Command{
    constructor(){
        super({
             name: "puppy", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["puppy", "dog", "doggo"], //any message (excluding prefix) that will trigger this command.
             group: "Fun", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Sends a random picture of a dog", //this will show in the help message
             example: ">>puppy",             
             guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        let embed = new Discord.RichEmbed();
        if(msg.guild)
            embed.setColor(msg.guild.me.displayColor);
        else
            embed.setColor([127, 161, 216]);
        require("random-puppy")().then(url => {
            embed.setImage(url);
            msg.channel.send("", {"embed": embed}).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }
}