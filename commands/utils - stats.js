const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class UDefine extends DBF.Command{
    constructor(){
        super({
             name: "stats", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["stat", "stats", "statistics", "statistic"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Shows some of Harley's basic statistics.", //this will show in the help message
             example: ">>stat",             
             guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqUser: true,
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        function toHHMMSS (uptime) {
            var sec_num = uptime; // don't forget the second param
            var days    = Math.floor(sec_num / 86400);
            var hours   = Math.floor((sec_num - (days * 86400)) / 3600);
            var minutes = Math.floor((sec_num - (days * 86400) - (hours * 3600)) / 60);
            var seconds = Math.round(sec_num - (days * 86400) - (hours * 3600) - (minutes * 60));

            if (hours   < 10) {hours   = "0"+hours;}
            if (minutes < 10) {minutes = "0"+minutes;}
            if (seconds < 10) {seconds = "0"+seconds;}
            var time    = "**" + days + "**:**" + hours+'**:**'+minutes+'**:**'+seconds + "**";
            return time;
        }
        let msg = params.msg; let args = params.args; let user = params.user;
        if(user && user != msg.client.user) return msg.client.commands.find(cmd => cmd.areYou("info")).run(params);
        let guilds = msg.client.guilds.array().length;
        let voiceConnections = msg.client.guilds.filter(g => g.voiceConnection).array().length;
        let users = msg.client.users.array().length;
        let ping = msg.client.ping.toFixed(2) + " ms";
        let uptime = toHHMMSS(process.uptime());
        uptime = uptime.split(":")[0] + " days " + uptime.split(":")[1] + " hours " + uptime.split(":")[2] + " minutes " + uptime.split(":")[3] + " seconds ";
        let memUsage = "~ " + Math.round(process.memoryUsage().rss / 10000000) + " MB";
        let myEmbed = new Discord.RichEmbed();
        if(msg.guild)
            myEmbed.setColor(msg.guild.me.displayColor);
        else
            myEmbed.setColor([127, 161, 216]);

        myEmbed.addField("Servers", guilds, true);
        myEmbed.addField("Users", users, true);
        myEmbed.addField("Connections", voiceConnections, true);
        myEmbed.addField("Ping", ping, true);
        myEmbed.addField("Memory usage", memUsage, true);        
        myEmbed.addField("Uptime", uptime);
        
        myEmbed.addField("Bot Invite", "[**Invite me!**](https://discordapp.com/oauth2/authorize?client_id=300828323443900416&scope=bot&permissions=305654848)")
        msg.channel.send("", {"embed": myEmbed}).catch(err => console.log(err));
    }
} 