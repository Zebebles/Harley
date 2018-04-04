const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class Pay extends DBF.Command{
    constructor(){
        super({
             name: "pay", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["give"], //any message (excluding prefix) that will trigger this command.
             group: "Economy", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Send a rice payment to someone", //this will show in the help message
             example: ">>pay @user amount\n>>pay username amount",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel. This prevents that.
             reqArgs: true,
             reqUser: true
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        
        if(!user)
            return msg.channel.send("I couldn't find the recipient of this transaction, sorry.").catch(err => console.log(err));
        if(user.bot)
            return msg.channel.send("Bot's don't accept rice payments, sorry.").catch(err => console.log(err));
        
        args = args ? args.replace(user.id, "") : null;
        
        if(!args || !args.match(/(\d+|all|half)/gi))
            return msg.channel.send("Please specify the amount of rice you wish to send in this payment.");
        
        let amount = args.match(/\d+/g) ? parseInt(args.match(/\d+/g)[0]) : (args.match(/all/gi) ? msg.author.rep : Math.floor(msg.author.rep/2));
        
        if(amount < 0)
            return msg.channel.send("Nice try, but you can't send negative rice");
        if(amount > msg.author.rep)
            return msg.channel.send("You only have `" + msg.author.rep + "` rice avaliable.");
        
        msg.author.rep -= amount;
        user.rep ? user.rep += amount : user.rep = amount
        msg.client.syncUser(msg.author);
        msg.client.syncUser(user);

        msg.channel.send("**" + msg.author.username + "You sent a payment of `" + amount + "` :rice: rice to " + user).catch(err => console.log(err));
    }
}