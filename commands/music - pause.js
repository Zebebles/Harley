const DBF = require('discordjs-bot-framework');


module.exports = class Pause extends DBF.Command{
    constructor(){
        super({
             name: "pause",
             triggers: ["pause", "resume" , "unpause", "freeze"],
             group: "Music",
             ownerOnly : false,
             description: "Pauses / Un-pauses the current playing track.",
             example: ">>pause",             
             guildOnly : true,
        });
    }
    run(params = {msg, args}){
        let msg = params.msg; let args = params.args;
        let channel = msg.guild.voiceConnection;
        if(!channel) return msg.channel.send("There isn't anything playing.").catch(err => console.log(err));
        if(!channel.dispatcher && !msg.guild.playlist.paused) return;
        if(channel.channel != msg.member.voiceChannel)
            return msg.channel.send("You have to be in the same channel as me to do that.")
                .then(m => m.delete(2500).catch(err => console.log(err)))
                .catch(err => console.log(err));
        let djrole = msg.guild.roles.find(r => r.name.match(/dj[^a-zA-Z]|[^a-zA-Z]dj/gi) || r.name.toLowerCase() == "dj");
        if(djrole && msg.member.voiceChannel && msg.member.voiceChannel.members.find(m => m.roles.find(r => r.id == djrole.id)) && !msg.member.roles.find(r => r.id == djrole.id))
            return msg.channel.send("The role `" + djrole.name + "` has been recognised as a DJ role, and at least one person in the channel has it. You must have this role to interact with the music.")
                .then(m => m.delete(3000).catch(err => console.log(err)))
                .catch(err => console.log(err));
     
        if(!msg.guild.playlist.paused){
            if(msg.guild.playlist.timeout)
                clearTimeout(msg.guild.playlist.timeout);
            msg.guild.playlist.paused = !msg.guild.playlist.paused;
            msg.guild.playlist.updateMessage();
            msg.guild.playlist.queue[0].seeks++;
            msg.guild.playlist.queue[0].startTime += channel.dispatcher.time;
            channel.dispatcher.end("dont");
        }else{
            msg.guild.playlist.playNext();
        }

    }
}