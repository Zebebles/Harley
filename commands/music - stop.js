const DBF = require('discordjs-bot-framework');

module.exports = class Hello extends DBF.Command{
    constructor(){
        super({
             name: "stop",
             triggers: ["stop", "leave", "dc", "disconnect"],
             group: "Music",
             ownerOnly : false,
             description: "Stops playing music and leaves the channel.",
             example: ">>stop",             
             guildOnly : true,
        });
    }
    run(params = {msg, args}){
        let msg = params.msg; let args = params.args;
        let channel = msg.guild.voiceConnection;
        if(!channel) return msg.channel.send("There isn't anything playing?").catch(err => console.log(err));
        if(channel.channel != msg.member.voiceChannel)
            return msg.channel.send("You have to be in the same channel as me to do that.")
                .then(m => m.delete(2500).catch(err => console.log(err)))
                .catch(err => console.log(err));
        let djrole = msg.guild.roles.find(r => r.name.match(/dj[^a-zA-Z]|[^a-zA-Z]dj/gi) || r.name.toLowerCase() == "dj");
        if(djrole && msg.member.voiceChannel && msg.member.voiceChannel.members.find(m => m.roles.find(r => r.id == djrole.id)) && !msg.member.roles.find(r => r.id == djrole.id))
            return msg.channel.send("The role `" + djrole.name + "` has been recognised as a DJ role, and at least one person in the channel has it. You must have this role to interact with the music.")
                .then(m => m.delete(3000).catch(err => console.log(err)))
                .catch(err => console.log(err));
        msg.guild.playlist.updateMessage("Requested by " + msg.member);
        if(channel.dispatcher)
            channel.dispatcher.end("dont");
        channel.disconnect();
        msg.client.voiceConnections.forEach(conn => {
            let done = false;
            conn.channel.members.forEach(mem => {
                if(!done && msg.guild.members.filter(m => !m.user.bot).get(mem.id)){
                    done = true;
                    setTimeout( () => {
                        if(conn.dispatcher){
                            conn.dispatcher.pause();
                            conn.dispatcher.resume();
                        }
                        //console.log("Pausing and resuming in " + conn.channel.guild.name);
                    },250);
                }
            });
        });
        msg.guild.client.initPlaylist(msg.guild);        
    }

}