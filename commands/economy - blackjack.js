const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");
const Promise = require("bluebird");

module.exports = class BlackJack extends DBF.Command{
    constructor(){
        super({
             name: "blackjack", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["bj", "21", "twentyone"], //any message (excluding prefix) that will trigger this command.
             group: "Economy", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Try your luck in a game of blackjack against Harley", //this will show in the help message
             example: ">>blackjack 20\n>>blackjack all\n>>blackjack half",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs : true,
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        if(!args || !args.match(/(\d+|all|half)/gi))
            return msg.channel.send("Usage: `" + msg.guild.prefix +"bj <amount>`" ).catch(err => console.log(err));
        
        let amount = args.match(/\d+/g) ? parseInt(args.match(/\d+/g)[0]) : (args.match(/all/gi) ? msg.author.rep : Math.floor(msg.author.rep/2));

        if(!msg.author.rep || msg.author.rep < amount)
            return msg.channel.send("You don't enough rice for that bet.").catch(err => console.log(err));
        else if(amount < 5)
            return msg.channel.send("You can't bet less than 5 rice on one game.").catch(err => console.log(err));
        
        if(msg.author.hand)
            return msg.channel.send("You're already in a game of Blackjack.").catch(err => console.log(err));     

        let reactions = msg.guild.me.hasPermission("MANAGE_MESSAGES") && msg.guild.me.hasPermission("ADD_REACTIONS");
        let cardsPool = [1,2,3,4,5,6,7,8,9,10,11,12,13
                        ,1,2,3,4,5,6,7,8,9,10,11,12,13
                        ,1,2,3,4,5,6,7,8,9,10,11,12,13
                        ,1,2,3,4,5,6,7,8,9,10,11,12,13];
        shuffle(cardsPool);
        let filter;
        let collector;
        var emojis = ["👊", "🤞"];
        msg.author.rep -= amount;
        var players = [msg.author, {username: msg.client.user.username, bot: true}];
        players[0].emojis = [":hearts:", ":diamonds:"];
        players[1].emojis = [":black_heart:", ":spades:"];
        players[0].hand = {total: 0, cards: new Array()};
        players[1].hand = {total: 0, cards: new Array()};        
        hit(0);
        hit(0);
        hit(1);
        hit(1);
        let won;
        won = countCards(0);
        if(won != null)
            return winner(0);
        
        countCards(1);

        updateMessage(buildEmbed()).then(() => {
            if(reactions){ //if harley has perms to edit reactions
                filter = (r, user) => user.id == msg.author.id && emojis.find(e => r.emoji.name == e);
                collector = new Discord.ReactionCollector(msg.author.bjm, filter);
                reactions = true;
                msg.author.bjm.react(emojis[0]).then(r => msg.author.bjm.react(emojis[1]).catch(err => console.log(err))).catch(err => console.log(err));            
            }else{
                filter = m => m.author.id == msg.author.id && m.content.match(/hit|draw|stand|stay/gi);
                collector = new Discord.MessageCollector(msg.channel, filter);
            }
            
            collector.on("collect", collected => {
                if(reactions){ //if collector is collecting reactions
                    collected.remove(collected.users.find(u => u.id != msg.client.user.id));
                    if(collected.emoji.name == emojis[0])
                    {
                        hit(0);
                        won = countCards(0);
                        if(won != null){
                            collector.stop();
                            return winner(won);
                        }
                        updateMessage(buildEmbed());
                    }else{
                        stand();
                        collector.stop();
                    }
                }else{
                    if(collected.content.match(/hit|draw/gi))
                    {
                        hit(0);
                        won = countCards(0);
                        if(won != null){
                            collector.stop();
                            return winner(won);
                        }
                        updateMessage(buildEmbed()); 
                    }else
                    {
                        stand();
                        collector.stop();                        
                    }
                }
            });
            
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

        function hit(ind){
            var card = cardsPool.splice((Math.random()*cardsPool.length-1)+1,1)[0];
            if(card == 1)
                players[ind].hand.cards.push({type: "A", val: card});            
            else if(card == 11)
                players[ind].hand.cards.push({type: "Q", val: 10});
            else if(card == 12)
                players[ind].hand.cards.push({type: "K", val: 10});         
            else if(card == 13)
                players[ind].hand.cards.push({type: "J", val: 10});   
            else
                players[ind].hand.cards.push({type: card, val: card});
        }

        function countCards(ind){
            players[ind].hand.total = 0;
            players[ind].hand.cards.filter(c => c.type != "A").forEach(c => players[ind].hand.total += c.val);//count total
            players[ind].hand.cards.filter(c => c.type == "A").forEach(c => players[ind].hand.total += players[ind].hand.total > 10 ? 1 : 11); //add aces (can be 1 or 10)

            if(players[ind].hand.total == 21){
                return ind;                
            } //if the player has a blackjack
            else if(players[ind].hand.total > 21) //if the player is over 21
            {
                return ind == 0 ? 1 : 0; //other player wins
            } 
            return null;
        }

        function buildHand(ind, over){
            var message = "";
            for(var i = 0; i < players[ind].hand.cards.length; i++){
                if((i/2) == Math.floor(i/2))
                    message += players[ind].emojis[0];
                else
                    message += players[ind].emojis[1];                
                message += ind == 0 || i == 0 || over? players[ind].hand.cards[i].type + " " : "? ";
            }
            return message;
        }

        function stand(){
            while(players[1].hand.total < players[0].hand.total){
                hit(1);
                let won = countCards(1);
                if(won != null)
                    return winner(won);
            }
            players[1].hand.total == players[0].hand.total ? winner(-1) : (players[1].hand.total > players[0].hand.total ? winner(1) : winner(0));
        }

        function winner(ind){
            let embed = buildEmbed(true);
            ind == -1 ? msg.author.rep+=amount : (ind == 0 ? ((msg.author.hand.cards.length == 2 && msg.author.hand.total == 21) ? msg.author.rep += Math.ceil(amount*2.5) : msg.author.rep += amount*2) : null);
            if(ind == 1){
                embed.setAuthor("Blackjack | " + msg.author.username + "#" + msg.author.discriminator + " lost", msg.author.displayAvatarURL);
                embed.description = "You lost the game of Blackjack against Harley :c\nYou now have `" + msg.author.rep + "` rice (`-" + amount + "`).";
            }
            else if(ind != -1){    
                embed.setAuthor("Blackjack | " + msg.author.username + "#" + msg.author.discriminator + " won", msg.author.displayAvatarURL);
                if(msg.author.hand.cards.length == 2 && msg.author.hand.total == 21)
                    embed.description = "You won the game of Blackjack against Harley!\nYou now have `" + msg.author.rep + "` rice (`+" +  Math.ceil(amount*1.5) + "`).";
                else
                    embed.description = "You won the game of Blackjack against Harley!\nYou now have `" + msg.author.rep + "` rice (`+" +  amount + "`).";
            }
            else
            {
                embed.setAuthor("Blackjack | " + msg.author.username + "#" + msg.author.discriminator + " drew with Harley", msg.author.displayAvatarURL);
                embed.description = "You drew a game of Blackjack with Harley!\nYou still have `" + msg.author.rep + "` rice.";
            }
            updateMessage(embed);
            msg.client.syncUser(msg.author)
            cleanUp();
        }

        function updateMessage(embed){
            return new Promise((resolve, reject) => {
                if(!msg.author.bjm)
                    msg.channel.send("", {embed}).then(m => {
                        msg.author.bjm = m;
                        resolve();
                    }).catch(err => reject(err));
                else
                    msg.author.bjm.edit("", {embed}).then(() => resolve()).catch(err => msg.channel.send("", {embed}).then(m => {
                        msg.author.bjm = m;
                        resolve();
                    }).catch(err => reject(err)));                
            });
        }

        function buildEmbed(over){
            let embed = new Discord.RichEmbed();
            embed.setColor(msg.guild.me.displayColor);
            embed.setAuthor("Blackjack | " + msg.author.username + "#"+msg.author.discriminator + " is playing for " + amount + " rice", msg.author.displayAvatarURL);
            embed.setDescription("Blackjack is a card game where the goal is to get as close to 21\nas possible without going over.");
            embed.description += reactions ? "\nReact with :punch: to hit (draw a new card).\nReact with :fingers_crossed: to stand (finalize your hand)." : "\nType `hit` to hit (draw a new card).\nType `stand` to stand (finalize your hand).";            
            embed.addField(players[0].username + "(" + players[0].hand.total + ")", buildHand(0),true);
            over ? embed.addField(players[1].username + "(" + players[1].hand.total + ")", buildHand(1,over),true) : embed.addField(players[1].username + "(??)", buildHand(1),true);
            
            return embed;
        }

        function cleanUp(){
            if(reactions && msg.author.bjm)
                msg.author.bjm.clearReactions().catch(err => console.log(err));
            msg.author.bjm = null;
            msg.author.hand = null;
            msg.author.emoji = null;
        }
    }
};
