module.exports = class Item{
    constructor (params) // {id - int, name - string, description - string, price - int, emoji - string, args - string, useImmediately - bool}
    {
        if(params.id == null)
            throw Error("Must provide an ID.");
        else if(!params.name)
            throw Error("Must provide a name.");
        else if(!params.description)
            throw Error("Must provide a description");
        else if(!params.price)
            throw Error("Must provide a price.");
        else if(!params.emoji)
            throw Error("Must provide an Emoji.");
        this.id = params.id;
        this.name = params.name;
        this.description = params.description;
        this.price = params.price;
        this.emoji = params.emoji;
        this.useImmediately = params.useImmediately;
        this.args = params.args ? params.args : "";
    }

    areYou(ident)
    {
        return this.id == ident || this.name.includes(ident) || this.emoji == ident;
    }

    buy(msg)
    {
        /*
            Give the user the item, take their rice, and remove sync them in the db.
            Call use if this.useImmediately is true.
            Be sure to check that the user has enough rice for the purchase before purchasing.
        */
        
        msg.author.rep = msg.author.rep ? msg.author.rep - this.price : 0;
        
        if(this.useImmediately) //no need to give the user the item if they're going to use it straight away.
            return this.use(msg);

        if(!msg.author.items)
        {
            msg.author.items = [];
            msg.author.items.push({id: this.id, count: 1});
        }
        else if(msg.author.items.find(item => item.id == this.id))
            msg.author.items.find(item => item.id == this.id).count++;
        else
            msg.author.items.push({id: this.id, count: 1});
        
        msg.author.itemChanged = msg.author.items.find(item => item.id == this.id);

        msg.client.syncUser(msg.author);
        
        msg.channel.send(`:convenience_store: **${msg.author.username}**, you succesfully purchased a **${this.name}** ${this.emoji} for \`${this.price}\` rice!\nDon't forget to use it with \`${msg.guild.prefix}inventory use ${this.name} ${this.args}\``);
    }

    use(msg)
    {
        /*
            this should be called before the override. i.e. super(); then code.
            Removes the item from the users item list and syncs the user.
        */
        if(!this.useImmediately)
        {
            let usersItem = msg.author.items.find(item => item.id == this.id);
            usersItem.count--;  //reduce their item count by 1
    
            if(usersItem.count == 0)    //remove the item from the users items.
                msg.author.items = msg.author.items.filter(item => item.id != this.id);
        }
        
        msg.client.syncUser(msg.author);//update the user in the db.
    }
}