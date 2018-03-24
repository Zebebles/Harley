const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");
const Promise = require("bluebird");

module.exports = class BlackJack extends DBF.Command{
    constructor(){
        super({
             name: "badrice", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["br", "3c", "3cups"], //any message (excluding prefix) that will trigger this command.
             group: "Fun", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Which bowls of rice are off, and which one is good to eat? Play for fun or bet on which is the good rice.", //this will show in the help message
             example: ">>badrice\n>>badrice bet\n>>badrice 10\n>>badrice all",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs : true,
             reqBotPerms : ["ADD_REACTIONS", "MANAGE_MESSAGES"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        
        let amount;
        if(!args || !args.match(/\d+|half|all/gi))
            amount = 0;
        else
            amount = args.match(/\d+/g) ? parseInt(args.match(/\d+/g)[0]) : (args.match(/all/gi) ? msg.author.rep : Math.floor(msg.author.rep/2));
        if(!msg.author.rep)
            msg.author.rep = 0;
        if(amount > msg.author.rep)
            return msg.channel.send("You only have `" + msg.author.rep + "` rice avaliable to bet.");
        
        msg.author.rep -= amount;

        let emojis = ["🍛", "🍚", "🍙"];
        shuffle(emojis);

        let goodRice = emojis[Math.floor(Math.random() * emojis.length - 2)+1];
        let embed = new Discord.RichEmbed();
        embed.setAuthor("Bad Rice | " + msg.author.username, msg.author.displayAvatarURL);
        embed.setColor(msg.guild.me.displayColor);
        embed.description = ":japanese_goblin: You have 2 bad rice, 1 good rice. Which one's good?!\n\t" + emojis.join("\t");
        
        msg.channel.send("", {embed}).then(gameMsg => {
            gameMsg.react(emojis[0]).then(r => gameMsg.react(emojis[1]).then(r => gameMsg.react(emojis[2]).catch(err => console.log(err))).catch(err => console.log(err))).catch(err => console.log(err));

            const filter = (r, user) => user.id == msg.author.id && emojis.find(e => r.emoji.name == e);
            const collector = new Discord.ReactionCollector(gameMsg, filter);
            
            let timeout = setTimeout(() => {
                if(!collector.ended)
                {
                    gameMsg.clearReactions();
                    collector.stop();
                    embed.description = "😞 You waited too long, all the rice went bad!";
                    gameMsg.edit("", {embed}).catch(err => msg.channl.send("", {embed}).catch(err => console.log(err)));
                    msg.client.syncUser(msg.author);
                }
            },20000);

            collector.on("collect", collected => {
                collector.stop();
                gameMsg.clearReactions();
                let chosen = emojis.find(e => e == collected.emoji.name);
                if(goodRice == chosen)
                {
                    embed.description = "😌 You chose the good rice! ";
                    embed.description += amount>0 ? "You managed to salvage `" + amount*2 + "` rice from the bowl." : "";
                    msg.author.rep += amount*2;
                }
                else
                {
                    embed.description = "🤢 You chose the bad rice. ";
                    embed.description += amount>0 ? "It cost you `" + amount + "` rice." : "";
                }
                msg.client.syncUser(msg.author);
                gameMsg.edit("", {embed}).catch(err => console.log(err));
            });

        }).catch(err => {
            msg.author.rep += amount;
            console.log(err);
            msg.client.syncUser(msg.author);
        });

        function shuffle(a) {
            var j, x, i;
            for (i = a.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                x = a[i];
                a[i] = a[j];
                a[j] = x;
            }
        }
    }
}
