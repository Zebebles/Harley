const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = class Store{
    constructor ()
    {
        this.items = [];
        this.storeEmbed = new Discord.RichEmbed({title: ":convenience_store: Rice store", description: "Use `store buy item_name` to purchase an item.\nUse `store info item_name` for more info about any item.\n"});
        this.loadItems();
    }

    loadItems()
    {
        let itemsPath = path.join(__dirname, 'items');
        fs.readdir(itemsPath, (err, files) => {
            if(err) return console.log(err);
            files.forEach(file => {
                if (path.extname(file) == ".js"){
                    const Item = require(path.join(itemsPath, file));
                    const item = new Item();
                    item.filename = path.join(itemsPath, file);
                    this.items.push(item);
                    this.storeEmbed.description += "\n"+ item.emoji + " `($" + item.price + ")` **" + item.name + "**\t-\t" + item.description;
                }
            });
        });
    }

    fetchItem(identifier)
    {
        console.log(identifier);
        return this.items.find(item => item.areYou(identifier));
    }

    fetchItemInfo(identifier)
    {
        let item = this.fetchItem(identifier);
        return item ? `:convenience_store: **${item.name}** ${item.emoji} \`($${item.price})\`\t-\t${item.description}` : `:convenience_store: Sorry, I'm not selling any \`${identifier}\`'s`;
    }
}