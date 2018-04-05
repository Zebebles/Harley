const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = class Store{
    constructor ()
    {
        this.items = [];
        this.storeEmbed = new Discord.RichEmbed({title: ":convenience_store: Rice store", description: "", footer: "Use `store buy item_name` to purchase an item, or `store info item_name` for more info about any item."});
        this.loadItems();
    }

    loadItems()
    {
        fs.readdir("./items", (err, files) => {
            if(err) return console.log(err);
            files.forEach(file => {
                if (path.extname(file) == ".js"){
                    const Item = require(path.join('./items', file));
                    const item = new Item();
                    item.filename = path.join('./items', file);
                    this.items.push(item);
                    this.storeEmbed.description += "\n"+ item.emoji + " **" + item.name + "**\t-\t" + item.description;
                }
            });
        });
    }

    fetchItem(identifier)
    {
        return this.items.find(item => 
                    item.id == identifier ||
                    item.name.toLowerCase().includes(identifier.toLowerCase()) ||
                    item.emoji == identifier);
    }

    fetchItemInfo(identifier)
    {
        let item = this.fetchItem(identifier);
        return item ? `**${item.name}** ${item.emoji} \`($${item.price})\`\t-\t${item.description}` : `Sorry, I'm not selling any \`${identifier}\`'s`;
    }
}