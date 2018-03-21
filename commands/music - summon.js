const DBF = require('discordjs-bot-framework');

module.exports = class Hello extends DBF.Command{
    constructor(){
        super({
             name: "summon",
             triggers: ["summon", "summon", "join"],
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
        if(msg.guild.voiceConnection && msg.guild.member.voiceChannel.joinable && msg.guild.member.voiceChannel.speakable)
            msg.member.voiceChannel.join();
    }
}