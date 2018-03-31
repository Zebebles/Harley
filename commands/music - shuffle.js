const DBF = require('discordjs-bot-framework');


module.exports = class Hello extends DBF.Command{
    constructor(){
        super({
             name: "shuffle",
             triggers: ["mix", "mash"],
             group: "Music",
             ownerOnly : false,
             description: "Shuffles the queue.",
             example: ">>shuffle",             
             guildOnly : true,
        });
    }
    run(params = {msg, args}){
        let msg = params.msg; let args = params.args;
        let channel = msg.guild.voiceConnection;
        let queue = msg.guild.playlist.queue;
        if(!channel) return msg.channel.send("There aren't any songs queued for me to shuffle.").catch(err => console.log(err));
        if(channel.channel != msg.member.voiceChannel)
            return msg.channel.send("You have to be in the same channel as me to do that.")
                .then(m => m.delete(2500).catch(err => console.log(err)))
                .catch(err => console.log(err));
        let djrole = msg.guild.roles.find(r => r.name.match(/dj[^a-zA-Z]|[^a-zA-Z]dj/gi) || r.name.toLowerCase() == "dj");
        if(djrole && msg.member.voiceChannel && msg.member.voiceChannel.members.find(m => m.roles.find(r => r.id == djrole.id)) && !msg.member.roles.find(r => r.id == djrole.id))
            return msg.channel.send("The role `" + djrole.name + "` has been recognised as a DJ role, and at least one person in the channel has it. You must have this role to interact with the music.")
                .then(m => m.delete(3000).catch(err => console.log(err)))
                .catch(err => console.log(err));
        if(!channel && !channel.dispatcher) return msg.channel.send("There isn't anything playing??");

        shuffle(msg.guild.playlist.queue, msg.guild.playlist);

        msg.channel.send(":twisted_rightwards_arrows: Queue shuffled.  Use `" + msg.client.prefix + "queue` to view next 5 songs.").catch(err => console.log(err));

        function shuffle(array,playlist) {
            for (var i = array.length - 1; i > 1; i--) {
                var j = Math.floor(Math.random() * (i + 1)+1);
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return;
        }
    }

}   