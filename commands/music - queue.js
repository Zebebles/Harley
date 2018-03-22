const DBF = require('discordjs-bot-framework');
const snekfetch = require("snekfetch");
const yts = require('youtube-search');
const Discord = require("discord.js");

module.exports = class Queue extends DBF.Command{
    constructor(){
        super({
             name: "queue",
             triggers: ["queue", "que", "qeu", "qeueue"],
             group: "Music",
             ownerOnly : false,
             description: "Browse which songs are in the queue.",
             example: ">>queue page_number",             
             guildOnly : true,
             reqArgs : true,
             reqBotPerms : ["EMBED_LINKS"]
        });
    }
    run(params = {msg, args}){
        let msg = params.msg; let args = params.args;
        let channel = msg.guild.voiceConnection;
        let playlist = msg.guild.playlist;
        if(!channel) return msg.channel.send("There isn't anything playing.").catch(err => console.log(err));
        if(!channel && !channel.dispatcher) return msg.channel.send("There isn't anything playing.").catch(err => console.log(err));
        let page;
        if(args) page = parseInt(args);
        if(!page || isNaN(page)) page = 1;
        page--;
        let pages = Math.ceil(((playlist.queue.length)/5));
        if(page+1 > pages)
            page = pages-1;
        
        let embed = generateMessage(page);
        let qm;
        if(embed)    
            qm = msg.channel.send("", {embed}).catch(err => console.log(err));
        else
            return msg.channel.send("There is nothing in the queue.").catch(err => console.log(err));

        if(qm && msg.guild.me.hasPermission("MANAGE_MESSAGES") && msg.guild.me.hasPermission("ADD_REACTIONS") && pages > 1)
            qm.then(m => m.react("⬅").catch(err => console.log(err))
            .then(prev => m.react("➡").catch(err => console.log(err)).then(next => {
                const filter = (r,user) => user.id != m.client.user.id && (r.emoji.name == prev.emoji.name || r.emoji.name == next.emoji.name);
                let collector = new Discord.ReactionCollector(m, filter);
                
                var timeout = setTimeout(() => {
                    m.clearReactions();
                    collector.stop();
                },10000);

                collector.on("collect", reaction => {
                    clearTimeout(timeout);
                    reaction.remove(reaction.users.find(u => !u.bot)).then(() => {
                        if(reaction.emoji.name == prev.emoji.name)
                            page--;
                        else
                            page++;
                        if(page+1 > pages)
                            page = 0;
                        else if(page < 0)
                            page = pages-1;
                        embed = generateMessage(page);
                        m.edit("", {embed}).catch(err => console.log(err));

                        timeout = setTimeout(() => {
                            m.clearReactions();
                            collector.stop();
                        },10000);
                    });
                });
            })));
    
    
        function generateMessage(page){
            let message = "";
            let done = false;
            let ind = 0;
            for(let i = 1+(5*page); i < 6+(5*page) && !done; i++){
                ind++;
                if(ind == 6+(5*page) || i >= playlist.queue.length)
                    done = true;
                else
                    message += "\n**" + (ind+(page*5)) + "**\t-\t`" + playlist.queue[i].title + "`";
            }


            if(message != ""){
                let myEmbed = new Discord.RichEmbed();
                myEmbed.setColor(msg.guild.me.displayColor);
                myEmbed.setTitle("Showing page " + (page+1) + " of " + pages + ".");
                myEmbed.setDescription(message);
                if(page+1 == pages)
                    myEmbed.setFooter("Showing 5 of " + (playlist.queue.length) + " songs.");
                else
                    myEmbed.setFooter("Showing 5 of " + (playlist.queue.length) + " songs.  Use " + msg.guild.prefix + "queue " + (page+2) + " for more results");
                
                return myEmbed;
            }else
                return null;
        }
    }

}