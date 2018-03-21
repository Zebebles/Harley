const DBF = require('discordjs-bot-framework');
const snekfetch = require("snekfetch");
const yta = require("simple-youtube-api");
const ytas = new yta('AIzaSyC3OGAw7qu6sA1XyQJLExw_Mn73Iw7KMDA');

module.exports = class Hello extends DBF.Command{
    constructor(){
        super({
             name: "repeat",
             triggers: ["repeat", "replay", "playagain"],
             group: "Music",
             ownerOnly : false,
             description: "Play the current song again.",
             example: ">>repeat",             
             guildOnly : true,
        });
    }
    run(params = {msg, args}){
        let msg = params.msg; let args = params.args;
        let playlist = msg.guild.playlist;
        let currentSong = playlist.queue[0];
        let channel = msg.guild.voiceConnection;
        if(!channel) return msg.channel.send("Use `" + msg.client.prefix + "play` when there's nothing queued");
        if(channel.channel != msg.member.voiceChannel)
            return msg.channel.send("You have to be in the same channel as me to do that.").then(m => m.delete(2500));
        if(channel.channel != msg.member.voiceChannel)
            return msg.channel.send("You have to be in the same channel as me to do that.").then(m => m.delete(2500));
        if(!channel && !channel.dispatcher) return msg.channel.send("Use `" + msg.client.prefix + "play` when there's nothing queued");
        if(!channel.dispatcher) return;
        let djrole = msg.guild.roles.find(r => r.name.match(/dj[^a-zA-Z]|[^a-zA-Z]dj/gi) || r.name.toLowerCase() == "dj");
        if(djrole && msg.member.voiceChannel && msg.member.voiceChannel.members.find(m => m.roles.find(r => r.id == djrole.id)) && !msg.member.roles.find(r => r.id == djrole.id))
            return msg.channel.send("The role `" + djrole.name + "` has been recognised as a DJ role, and at least one person in the channel has it. You must have this role to interact with the music.").then(m => m.delete(3000));
        currentSong.startTime = 0;
        currentSong.seeks = 0;
        playlist.queue.splice(0, 0, currentSong);
        msg.channel.send(":repeat_one: `" + currentSong.title + "` will play again.");
    }

}