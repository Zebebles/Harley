const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");
const Promise = require("bluebird");

module.exports = class BlackJack extends DBF.Command{
    constructor(){
        super({
             name: "ricestacker", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["ricestack", "stacker", "stack", "rs"], //any message (excluding prefix) that will trigger this command.
             group: "Fun", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "How many bowls of rice can Harley stack on top of each other?! Play for fun, or bet on the outcome.", //this will show in the help message
             example: ">>stacker\n>>stacker 10\n>>stacker all",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs : true,
             reqBotPerms : ["ADD_REACTIONS", "MANAGE_MESSAGES","EMBED_LINKS"]
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

        let emojis = ["👆", "🛑"];
        let bowls = ["🍚"];
        let chances = [1, 1, 1, 1, 1, 1, 1];//0.75, 0.6, 0.5, 0.25, 0.125, 0.0625]
        let rewards = [0, 0, 1, 2, 4, 8, 16];
        let embed = new Discord.RichEmbed();
        embed.setAuthor("Rice Stacker | " + msg.author.username, msg.author.displayAvatarURL);
        embed.setColor(msg.guild.me.displayColor);
        embed.description = bowls.join("\n") + ":japanese_goblin: Quick! I have a big order, how many bowls of rice can I stack?!";
        
        msg.channel.send("", {embed}).then(gameMsg => {
            gameMsg.react(emojis[0]).then(r => gameMsg.react(emojis[1]).catch(err => console.log(err))).catch(err => console.log(err));

            const filter = (r, user) => user.id == msg.author.id && emojis.find(e => r.emoji.name == e);
            const collector = new Discord.ReactionCollector(gameMsg, filter);
            
            let timeout = setTimeout(() => {
                if(!collector.ended)
                {
                    gameMsg.clearReactions();
                    collector.stop();
                    embed.description = ":scream: You took so long that I dropped all the bowls!";
                    if(amount)
                        embed.description += " You owe me `" + amount + "` rice...";
                    gameMsg.edit("", {embed}).catch(err => msg.channl.send("", {embed}).catch(err => console.log(err)));
                    msg.client.syncUser(msg.author);
                }
            },45000);

            collector.on("collect", collected => {
                collected.remove(collected.users.find(u => !u.bot)).then(() => {
                    if(collected.emoji.name == emojis[1])//IF THEY GIVE UP, GIVE THEM THEIR REWARD.
                    {
                        clearTimeout(timeout);
                        collector.stop();
                        gameMsg.clearReactions();
                        embed.description = "😄 Wow, I could stack `" + bowls.length+"` bowls!!";
                        if(amount && rewards[bowls.length-1])
                            embed.description += " Here's `" + amount*rewards[bowls.length-1] + "` rice for your trouble.";
                        msg.author.rep += amount*rewards[bowls.length-1];
                        msg.client.syncUser(msg.author);
                        gameMsg.edit("", {embed}).catch(err => console.log(err));
                    }
                    else
                    {
                        bowls.push("🍚");
                        if(Math.random() > chances[bowls.length-1]) //IF THEY ADD ANOTHER BUT IT TIPS OVER
                        {
                            clearTimeout(timeout);
                            collector.stop();
                            gameMsg.clearReactions();
                            embed.description = ":scream: I couldn't stack `" + bowls.length + "`, I dopped them all!!";
                            if(amount)
                                embed.description += " You owe me `" + amount + "` rice...";
                            msg.client.syncUser(msg.author);
                            gameMsg.edit("", {embed}).catch(err => msg.channl.send("", {embed}).catch(err => console.log(err)));
                        }
                        else //IF TI DOESNT TIP OVER
                        {
                            if(bowls.length == chances.length) //IF THAT WAS THE LAST BOWL POSSIBLE
                            {
                                clearTimeout(timeout);
                                collector.stop();
                                embed.description = "😲 Oh my god! I could stack `" + bowls.length+"` bowls!!";
                                if(rewards[bowls.length-1] * amount)
                                    embed.description += " Here's`" + rewards[bowls.length-1]*amount + "` rice for your help.";
                                gameMsg.edit("", {embed}).catch(err => msg.channl.send("", {embed}).catch(err => console.log(err)));
                                msg.author.rep += amount*rewards[bowls.length-1];
                                return msg.client.syncUser(msg.author);
                            }
                            embed.description = bowls.join("\n") + ":japanese_goblin: Can I stack another?!";
                            if(rewards[bowls.length] * amount)
                                embed.description += " I'll give you `" + rewards[bowls.length]*amount + "` rice if you're right!";
                            gameMsg.edit("", {embed}).catch(err => msg.channl.send("", {embed}).catch(err => console.log(err)));
                            return msg.client.syncUser(msg.author);
                        }
                    }
                });
            });

        }).catch(err => {
            msg.author.rep += amount;
            console.log(err);
            msg.client.syncUser(msg.author);
        });
    }
}
