const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");
const booru = require("booru");

module.exports = class Rule34 extends DBF.Command{
    constructor(){
        super({
             name: "rule34", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["r34"], //any message (excluding prefix) that will trigger this command.
             group: "NSFW", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Searches rule34 for specified tags.", //this will show in the help message
             example: ">>rule34 tags_seperated_by_a_space\n>>rule34 my_little_pony rainbow_dash",             
             guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs: true,
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        let embed = new Discord.RichEmbed();
        if(!msg.channel.nsfw)
            return msg.channel.send("That command is only allowed in NSFW channels.");
        if(msg.guild)
            embed.setColor(msg.guild.me.displayColor);
        else
            embed.setColor([127, 161, 216]);
        if(!args)
            args = "";
        args += " ";
        booru.search('rule34.paheal.net', args.split(" "), {limit: 1, random: true}).then(images => booru.commonfy(images).then(images => {
            embed.setTitle("Rule 34 search - " + args.substr(0,50));
            embed.setImage(images[0].common.file_url);
            msg.channel.send("", {embed});
        }).catch(err => {
            msg.channel.send("Couldn't find any images under `" + args.substr(0,100) + "`");
        }));
    }
}