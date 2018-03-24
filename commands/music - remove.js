const DBF = require('discordjs-bot-framework');
const snekfetch = require("snekfetch");
const yts = require('youtube-search');
const Discord = require('discord.js');


module.exports = class Remove extends DBF.Command{
    constructor(){
        super({
             name: "remove",
             triggers: ["removetrack", "removesong", "deletesong", "deletetrack"],
             group: "Music",
             ownerOnly : false,
             description: "Removes specified track or range of tracks from the queue.",
             example: ">>remove song_name or queue_position or range\n>>remove never gonna give you up\n>>remove 1\n>>remove 1-5",             
             guildOnly : true,
             reqArgs: true,
             reqBotPerms : ["EMBED_LINKS"]
        });
    }
    run(params = {msg, args}){
        let msg = params.msg; let args = params.args;
        let channel = msg.guild.voiceConnection;
        let playlist = msg.guild.playlist;
        if(!channel) return msg.channel.send("There aren't any tracks queued for me to remove.").catch(err => console.log(err));
        if(!channel && !channel.dispatcher) return msg.channel.send("There aren't any tracks queued for me to remove").catch(err => console.log(err));
        if(channel.channel != msg.member.voiceChannel)
            return msg.channel.send("You have to be in the same channel as me to do that.").then(m => m.delete(2500).catch(err => console.log(err))).catch(err => console.log(err));
        let djrole = msg.guild.roles.find(r => r.name.match(/dj[^a-zA-Z]|[^a-zA-Z]dj/gi) || r.name.toLowerCase() == "dj");
        if(djrole && msg.member.voiceChannel && msg.member.voiceChannel.members.find(m => m.roles.find(r => r.id == djrole.id)) && !msg.member.roles.find(r => r.id == djrole.id))
            return msg.channel.send("The role `" + djrole.name + "` has been recognised as a DJ role, and at least one person in the channel has it. You must have this role to interact with the music.")
                .then(m => m.delete(3000).catch(err => console.log(err)))
                .catch(err => console.log(err));;
        if(playlist.queue.length == 1)
            return msg.channel.send("There aren't any tracks queued for me to remove.").catch(err => console.log(err));
        let track;
        if(!args.match(/\d+(-\d+)?/g) || args.replace(/\d+(-\d+)?/g,"") != "") //if args is not a number or a range of numbers
            track = playlist.queue.indexOf(playlist.queue.find(t => t.title.toLowerCase().includes(args.toLowerCase())))
        else{
            if(args.match(/\d+-\d+/g)) //if args is a range of numbers
            {
                let start = args.match(/\d+/g)[0];
                let end = args.match(/\d+/g)[1];
                if(start < 1 || end > msg.guild.playlist.queue.length-1)
                    return msg.channel.send("Please provide a range between `1** and `" + (msg.guild.playlist.queue.length-1) + "`").catch(err => console.log(err));

                playlist.queue.splice(start, (end-start)+1);
                let embed = new Discord.RichEmbed();
                embed.setTitle(((end-start)+1)+" tracks removed from queue");
                embed.setColor(msg.guild.me.displayColor);
                embed.addField("Range removed", start + " - " + end);
                return msg.channel.send("", {embed}).catch(err => console.log(err));
            }
            track = args.match(/\d+/g)[0];
        }
        if(!track)
            return msg.channel.send("Couldn't find a track to remove under `" + args.substr(0, 100) + "`").catch(err => console.log(err));
        else if(track < 1 || track > msg.guild.playlist.queue.length-1)
            return msg.channel.send("Please provide a queue position between `1` and `" + (msg.guild.playlist.queue.length-1) + "`").catch(err => console.log(err));

        track = playlist.queue.splice(track, 1);
        let embed = new Discord.RichEmbed();
        embed.setTitle("Track removed from queue");
        embed.setColor(msg.guild.me.displayColor);
        embed.setDescription(track[0].title);
        embed.setThumbnail(track[0].image); 
        msg.channel.send("", {embed}).catch(err => console.log(err));
        
    }
}