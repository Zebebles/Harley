const DBF = require('discordjs-bot-framework');

module.exports = class Hello extends DBF.Command{
    constructor(){
        super({
             name: "summon",
             triggers: ["join", "come"],
             group: "Music",
             ownerOnly : false,
             description: "Summons Harley to the voice channel",
             example: ">>summon",             
             guildOnly : true,
             reqBotPerms: ["CONNECT","SPEAK"]
        });
    }
    run(params = {msg, args}){
        let msg = params.msg;
        if(msg.guild.voiceConnection && msg.member.voiceChannel && msg.member.voiceChannel.joinable && msg.member.voiceChannel.speakable)
        {
            msg.member.voiceChannel.join().catch(err => console.log(err));
            msg.guild.playlist.voiceChannel = msg.member.voiceChannel;
        }   
    }
}