const DBF = require('discordjs-bot-framework');


module.exports = class Hello extends DBF.Command{
    constructor(){
        super({
             name: "seek",
             triggers: ["seek", "forward", "fastforward", "ff"],
             group: "Music",
             ownerOnly : false,
             description: "Skips to specified time in the current song.",
             example: ">>seek hh:mm:ss",             
             guildOnly : true,
             reqArgs : true,
        });
    }
    run(params = {msg, args}){
        let msg = params.msg; let args = params.args;
        let channel = msg.guild.voiceConnection;
        let seekTime;
        let h = false;
        let ms = 0;
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
        if(!channel && !channel.dispatcher) return msg.channel.send("There needs to be something playing for me to do that.");
        if(!channel.dispatcher) return;
        
        if(args.match(/\d{1,2}:\d{1,2}/g))
            h = false;
        else if (args.match(/\d{1,2}:\d{1,2}:\d{1,2}/g))
            h = true;
        else
            return msg.channel.send("**Usage:** `seek (hh:)mm:ss`");

        let hrs = 0;
        let mins = 0;
        let secs = 0;
        if(h){
            hrs = args.split(":")[0];
            mins = args.split(":")[1];
            secs = args.split(":")[2];
        }else{
            mins = args.split(":")[0];
            secs = args.split(":")[1];
        }

        ms = (hrs*3600000) + (mins*60000) + (secs*1000);

        if(msg.guild.playlist.queue[0].duration <= 0)
            return msg.channel.send("You can't seek live streams");
        else if(ms > msg.guild.playlist.queue[0].duration*1000)
            return msg.channel.send("You can't seek past the end of the song.");
        else if(ms < 0)
            return msg.channel.send("You can't seek before the start of the song.");
        
        msg.channel.send("Seeking to `" + msg.guild.playlist.getDurationString(ms/1000) + "` as requested by **" + msg.member.displayName + "**").catch(err => console.log(err));
        msg.guild.playlist.queue[0].startTime = ms;
        msg.guild.playlist.queue[0].seeks++;
        msg.guild.playlist.queue.splice(0,0,msg.guild.playlist.queue[0]);
        msg.guild.voiceConnection.dispatcher.end("seek");
    }
}