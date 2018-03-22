const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class Rep extends DBF.Command{
    constructor(){
        super({
             name: "rice", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["bal", "balance", "money", "bank"], //any message (excluding prefix) that will trigger this command.
             group: "Economy", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Check how much rice someone has saved up, and their leaderboard position.", //this will show in the help message
             example: ">>rice @user\n>>rice username",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel. This prevents that.
             reqArgs: true,
             reqUser: true,
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        
        if(args && args.toLowerCase().trim() == "daily")
            return msg.client.commands.find(c => c.areYou("daily")).run(params);
        if(!user || user.bot)
            user = msg.author;
        let embed = new Discord.RichEmbed();
        embed.setColor(msg.guild.me.displayColor);
        embed.setThumbnail(user.displayAvatarURL);
        embed.setTitle("Rice stats - " + user.username + "#" + user.discriminator);
        if(user.rep == null)
            user.rep = 0;
        let users = msg.client.users.filter( u => u.rep != null).array().sort((a,b) =>  b.rep - a.rep);
        embed.addField("Rice", user.rep + " grains");
        embed.addField("Server ranking", "# " + (users.filter(u => msg.guild.members.get(u.id)).indexOf(user)+1), true);
        embed.addField("Global ranking", "# " + (users.indexOf(user)+1), true);
        msg.channel.send("", {embed}).catch(err => console.log(err));
        
        function getTimeString(time){
            var delta = (time - new Date().getTime())/1000;
            var hours = Math.floor(delta / 3600) % 24;
            delta -= hours * 3600;
            var minutes = Math.floor(delta / 60) % 60;
            delta -= minutes * 60;
            var seconds = Math.round(delta % 60);			
    
            return "`"+ hours + "` hours `" + minutes + "` minutes and `" + seconds + "` seconds";
        }
    }
}