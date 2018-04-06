const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class InventoryCmd extends DBF.Command{
    constructor(){
        super({
             name: "inventory", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["inv", "backpack", "items"], //any message (excluding prefix) that will trigger this command.
             group: "Economy", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "View your inventory, and use any items you have in it.", //this will show in the help message
             example: ">>inventory\n>>inventory use item_name",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs: true
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg, args = params.args;
        
        /*
            Purchase an Item.
        */
        if(args && args.match(/(use)|(apply)/gi))
        {
            let itemID = (args.replace(/(use)|(apply)/gi,"").trim() + " ").split(" ")[0];
            let item = msg.client.store.fetchItem(itemID);
            if(!item)
                return msg.channel.send(`:school_satchel: Sorry, you don't own any \`${itemID}\`'s`);
            else if( !msg.author.items.find(i => i.id == item.id))
                return msg.channel.send(`:school_satchel: Sorry, you don't own any \`${item.name}\`'s, but you can buy some with \`${msg.guild.prefix}store buy ${item.name}\``)
            else
            {
                return item.use(msg);
            }
        }
        if(!msg.author.items || msg.author.items.length == 0)
            return msg.channel.send("🎒 You don't have any items in your Inventory.\nUse `" + msg.guild.prefix + "store` to buy some items.");
        let embed = new Discord.RichEmbed() 
        .setTitle("🎒 Inventory | " + msg.author.username)
        .setColor(msg.guild.me.displayColor)
        .setDescription("Use `inventory use item_name` to use an item.\n");
        msg.author.items.forEach(item => {
            let fullItem = msg.client.store.fetchItem(item.id);
            embed.description += "\n"+ fullItem.emoji + " **" + fullItem.name + "** `("+item.count+")`\t-\t" + fullItem.description;
        });

        return msg.channel.send("", {embed});
    }
}