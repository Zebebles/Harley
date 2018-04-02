const DBF = require('discordjs-bot-framework');
const snekfetch = require("snekfetch");
const yta = require("simple-youtube-api");

module.exports = class Hello extends DBF.Command{
    constructor(){
        super({
             name: "autoplay",
             triggers: ["autoplay", "auto"],
             group: "Music",
             ownerOnly : false,
             description: "When this is enabled, Harley will search YouTube for related songs to play when the queue is empty.",
             example: ">>autoplay",             
             guildOnly : true,
        });
    }
    run(params = {msg, args}){
        let msg = params.msg;
        const ytas = new yta(msg.client.auth.googleKey);
        let channel = msg.member.voiceChannel;
        if(!msg.author.donationTier)
            return msg.channel.send("Sorry, this command is for donators only.  Visit **<http://www.harleybot.me/donate/>** for more information.");
        if(!channel) return msg.channel.send("You need to play a song first.").catch(err => console.log(err));
        if(!channel && !channel.dispatcher) return msg.channel.send("You need to play a song first.").catch(err => console.log(err));
        if(msg.guild.playlist.queue.length == 0) return msg.channel.send("You need to play a song first.").catch(err => console.log(err));
        if(channel != msg.member.voiceChannel)
            return msg.channel.send("You have to be in the same channel as me to do that.")
                .then(m => m.delete(2500).catch(err => console.log(err)))
                .catch(err => console.log(err));;
        let djrole = msg.guild.roles.find(r => r.name.match(/dj[^a-zA-Z]|[^a-zA-Z]dj/gi) || r.name.toLowerCase() == "dj");
        if(djrole && msg.member.voiceChannel && msg.member.voiceChannel.members.find(m => m.roles.find(r => r.id == djrole.id)) && !msg.member.roles.find(r => r.id == djrole.id))
            return msg.channel.send("The role `" + djrole.name + "` has been recognised as a DJ role, and at least one person in the channel has it. You must have this role to interact with the music.")
                .then(m => m.delete(3000).catch(err => console.log(err)))
                .catch(err => console.log(err));;

        if(msg.guild.playlist.auto)
            msg.channel.send("Auto play is now **OFF**").catch(err => console.log(err));
        else
            msg.channel.send("Auto play is now **ON**").catch(err => console.log(err));
        
        msg.guild.playlist.auto = !msg.guild.playlist.auto;
    }
}