const Discord = require("discord.js");
const auth = require("../resources/auth.json");
const curl = require("curlrequest");

module.exports = function(){
    this.announceStream = function(old, updated){
        if(!old.user.bot && ((!old.presence.game || !old.presence.game.streaming) && (updated.presence.game && updated.presence.game.streaming))){            
            let streamerName = updated.presence.game.url.split("/")[updated.presence.game.url.split("/").length-1];
            let options = {
                url : "https://api.twitch.tv/helix/streams?user_login=" + streamerName,
                headers: {
                    "Client-ID" : auth.twitchKey
                }
            };
            curl.request(options, (err, data) => {
                if(err || !JSON.parse(data).data || !JSON.parse(data).data[0])
                    return this.sendStream(updated, "Unknown", "Unknown");
                let streamData = JSON.parse(data).data[0];
                options.url = "https://api.twitch.tv/helix/games?id=" + streamData.game_id;
                curl.request(options, (err, data) => {
                    if(!JSON.parse(data).data || !JSON.parse(data).data[0])
                        return this.sendStream(updated, "Unknown", streamData.viewer_count);
                    let game = JSON.parse(data).data[0];
                    this.sendStream(updated, game.name, streamData.viewer_count);
                });
            });          
        }  
    }

    this.sendStream = function(updated, game, viewers){
        let myEmbed = new Discord.RichEmbed();
        myEmbed.setColor([100,65,164]);
        myEmbed.setAuthor(updated.user.username + " is now live!", "https://cdn1.iconfinder.com/data/icons/micon-social-pack/512/twitch-512.png");
        myEmbed.setURL(updated.presence.game.url);
        myEmbed.setThumbnail(updated.user.avatarURL);
        myEmbed.addField("Stream Title", updated.presence.game.name);
        myEmbed.addField("Game", game);            
        myEmbed.addField("Viewers", viewers);
        
        var message = "";
        var channel = updated.guild.channels.filter(ch => ch.type == "text" && ch.topic).find(ch => ch.topic.toLowerCase().includes(updated.guild.prefix + "stream"));
        if(!channel.permissionsFor(member.guild.me).has("SEND_MESSAGES") || !member.guild.me.hasPermission("EMBED_LINKS"))
            return;
        if(channel.topic.toLowerCase().includes("+here"))
            message += "@here ";
        if(channel.topic.toLowerCase().includes("+everyone"))
            message += "@everyone";

        channel.send(message, {"embed" : myEmbed});
    }
}