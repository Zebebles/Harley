const DBF = require('discordjs-bot-framework');


module.exports = class Hello extends DBF.Command{
    constructor(){
        super({
             name: "skip",
             triggers: ["skip", "next"],
             group: "Music",
             ownerOnly : false,
             description: "Skip the current song.",
             example: ">>skip number_of_tracks",             
             guildOnly : true,
             reqArgs : true,
        });
    }
    run(params = {msg, args}){
        let msg = params.msg; let args = params.args;
        let channel = msg.guild.voiceConnection;
        let incrementN;
        if(!channel) return msg.channel.send("There isn't anything playing?");
        if(channel.channel != msg.member.voiceChannel)
            return msg.channel.send("You have to be in the same channel as me to do that.").then(m => m.delete(2500));
        let djrole = msg.guild.roles.find(r => r.name.match(/dj[^a-zA-Z]|[^a-zA-Z]dj/gi) || r.name.toLowerCase() == "dj");
        if(djrole && msg.member.voiceChannel && msg.member.voiceChannel.members.find(m => m.roles.find(r => r.id == djrole.id)) && !msg.member.roles.find(r => r.id == djrole.id))
            return msg.channel.send("The role `" + djrole.name + "` has been recognised as a DJ role, and at least one person in the channel has it. You must have this role to interact with the music.").then(m => m.delete(3000));
        if(!channel && !channel.dispatcher) return msg.channel.send("There isn't anything playing??");
        if(!args) incrementN = 0;
        else if(isNaN(parseInt(args))) incrementN = 0;
        else incrementN = parseInt(args)-1;
        if(incrementN > 0) msg.channel.send(`:track_next: Skipping \`${incrementN+1}\` tracks as requested by **${msg.member.displayName}**`);
        msg.guild.playlist.queue.splice(0,incrementN);
        let disp = channel.dispatcher;
        if(disp)
            disp.end();
        else
            msg.guild.playlist.playNext();
    }
}