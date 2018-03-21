const Discord = require("discord.js");

module.exports = function(){
    this.announceLeave = function(member) {
        let myEmbed = new Discord.RichEmbed();
        myEmbed.setColor([244, 89, 66]);
        myEmbed.setAuthor("",member.user.displayAvatarURL);
        myEmbed.setTitle("Member left the server");
        myEmbed.setDescription("**Member:** " + member + 
                                "\n**Member count:** " + member.guild.members.size );
        myEmbed.setFooter(new Date().toLocaleString("en-US",{"timeZone" : "Australia/Melbourne"}));
        let channel = member.guild.channels.filter(ch => ch.type == "text" && ch.topic).find(ch => ch.topic.toLowerCase().includes(member.guild.prefix + "join"));  
        if(!channel.permissionsFor(member.guild.me).has("SEND_MESSAGES") || !member.guild.me.hasPermission("EMBED_LINKS"))
            return;   
        let message = "";
        if(channel.topic.toLowerCase().includes("+here"))
            message += "@here ";
        if(channel.topic.toLowerCase().includes("+everyone"))
            message += "@everyone";

        channel.send(message,{"embed" : myEmbed});
    }

    this.announceJoin = function(member) {
        let myEmbed = new Discord.RichEmbed();
        myEmbed.setColor([65, 244, 107]);
        myEmbed.setAuthor("",member.user.displayAvatarURL);
        myEmbed.setTitle("Member joined the server");
        myEmbed.setDescription("**Member:** " + member + 
                                "\n**Member count:** " + member.guild.members.size );
        myEmbed.setFooter(new Date().toLocaleString("en-US",{"timeZone" : "Australia/Melbourne"}));
        let channel = member.guild.channels.filter(ch => ch.type == "text" && ch.topic).find(ch => ch.topic.toLowerCase().includes(member.guild.prefix + "join"));
        if(!channel.permissionsFor(member.guild.me).has("SEND_MESSAGES") || !member.guild.me.hasPermission("EMBED_LINKS"))
            return;
        let message = "";
        if(channel.topic.toLowerCase().includes("+here"))
            message += "@here ";
        if(channel.topic.toLowerCase().includes("+everyone"))
            message += "@everyone";

        channel.send(message, {"embed" : myEmbed});     
    }

    // this.announceMove = function(old, updated){
    //     let embed = new Discord.RichEmbed();
    //     embed.setColor([40,40,40]);
    //     embed.setAuthor(updated.displayName + "#" + updated.user.discriminator,updated.displayAvatarURL);
    //     embed.setDescription("**Action:** Move"
    //                         + "\n**From:** " + old.voiceChannel.name
    //                         + "\n**To:** " + updated.voiceChannel.name
    //                         );
    //     embed.setFooter(new Date().toLocaleString("en-US",{"timeZone" : "Australia/Melbourne"}));
    //     let channel = member.guild.channels.filter(ch => ch.type == "text" && ch.topic).find(ch => ch.topic.toLowerCase().includes(member.guild.prefix + "move"));
    //     if(!channel.permissionsFor(member.guild.me).has("SEND_MESSAGES") || !member.guild.me.hasPermission("EMBED_LNKS"))
    //         return;
    //     let message = "";
    //     if(channel.topic.toLowerCase().includes("+here"))
    //         message += "@here ";
    //     if(channel.topic.toLowerCase().includes("+everyone"))
    //         message += "@everyone";

    //     channel.send(message, {"embed" : embed});     
    // }
}    