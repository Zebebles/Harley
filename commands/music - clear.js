const DBF = require('discordjs-bot-framework');
const snekfetch = require("snekfetch");

module.exports = class Clear extends DBF.Command{
    constructor(){
        super({
             name: "clear",
             triggers: ["clear", "empty"],
             group: "Music",
             ownerOnly : false,
             description: "Clears the queue of all songs.",
             example: ">>clear",             
             guildOnly : true,
        });
    }
    run(params = {msg, args}){
        let msg = params.msg; let args = params.args;
        let channel = msg.guild.voiceConnection;
        let playlist = msg.guild.playlist;
        if(!channel) return msg.channel.send("There isn't anything playing.").catch(err => console.log(err));
        if(!channel && !channel.dispatcher) return msg.channel.send("There isn't anything playing.").catch(err => console.log(err));
        if(channel.channel != msg.member.voiceChannel)
            return msg.channel.send("You have to be in the same channel as me to do that.")
                .catch(err => console.log(err))
                .then(m => m.delete(2500).catch(err => console.log(err)));
        let djrole = msg.guild.roles.find(r => r.name.match(/dj[^a-zA-Z]|[^a-zA-Z]dj/gi) || r.name.toLowerCase() == "dj");
        if(djrole && msg.member.voiceChannel && msg.member.voiceChannel.members.find(m => m.roles.find(r => r.id == djrole.id)) && !msg.member.roles.find(r => r.id == djrole.id))
            return msg.channel.send("The role `" + djrole.name + "` has been recognised as a DJ role, and at least one person in the channel has it. You must have this role to interact with the music.")
                .then(m => m.delete(3000).catch(err => console.log(err)))
                .catch(err => console.log(err));
        let current = playlist.queue[0];
        let total = playlist.queue.length;
        playlist.queue = new Array();
        playlist.queue.push(current);
        //playlist.currentIndex = 0;
        msg.channel.send("Cleared `" + (total-1) + "` tracks from the queue.");
    }

}