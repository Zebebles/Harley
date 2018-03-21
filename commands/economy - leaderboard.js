const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class Rep extends DBF.Command{
    constructor(){
        super({
             name: "leaderboard", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["top", "rankings"], //any message (excluding prefix) that will trigger this command.
             group: "Economy", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Check the rice leaderboard.  Defaults to server leaderboard unless you specify otherwise", //this will show in the help message
             example: ">>leaderboard (global) (page_number)",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs: true,
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;

        let global;
        let page = 1;
        if(!args){
            global = false;
        }
        else if(args.toLowerCase().includes("global") || args.toLowerCase().includes("all"))
            global = true;
        
        if(args && args.match(/\d+/g))
            page = args.match(/\d+/g)[0];
        if(page < 0)//make pos
            page = page * -1;
        
        let users = new Array();
        if(global){
            users = msg.client.users.array().filter(u => u.rep != null);
        }else{
            users = msg.guild.members.array().filter(m => m.user.rep != null);
            for(var i = 0; i < users.length; i++)
                users[i] = users[i].user;
        }
        users = users.sort((a,b) => b.rep - a.rep);
        user = users.indexOf(msg.author);
        let pages = Math.floor(users.length/5)+1;

        if(pages < page)
            page = Math.floor(users.length/5)+1;
        if(page!=0)
            page--;
        
        let embed = generateMessage(page);

        let qm = msg.channel.send("", {embed});

        if(qm && msg.guild.me.hasPermission("MANAGE_MESSAGES") && msg.guild.me.hasPermission("ADD_REACTIONS") && pages > 1)
            qm.then(m => m.react("⬅")
            .then(prev => m.react("➡").then(next => {
                const filter = (r,user) => user.id != m.client.user.id && (r.emoji.name == prev.emoji.name || r.emoji.name == next.emoji.name);
                let collector = new Discord.ReactionCollector(m, filter);
                let timeout = setTimeout(() => {
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
                        m.edit("", {embed});

                        timeout = setTimeout(() => {
                            m.clearReactions();
                            collector.stop();
                        },10000);
                    });
                });
            })));

        function generateMessage(page){
            let embed = new Discord.RichEmbed();
            embed.setColor(msg.guild.me.displayColor);
            
            if(global)
                embed.setTitle("Global rice leaderboards");
            else
                embed.setTitle("Server rice leaderboards");
            let message = "";

            for(var i = 0+(page*5); i < 5+(page*5) && i < users.length; i++)
                message += `**${i+1}**\t-\t\`${users[i].username}#${users[i].discriminator}\`\t-\t\`${users[i].rep}\` rice\n`;

            embed.setDescription(message);

            embed.setFooter(`Showing page ${page+1} of ${pages}`);

            return embed;
        }
    }
}