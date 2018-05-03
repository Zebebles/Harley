const Item = require("../item.js");

module.exports = class LovePoint extends Item{
    constructor () // {id - int, name - string, description - string, price - int, emoji - string, args - string, useImmediately - bool}
    {
        super({
            id: 0,
            name: "Love",
            description: "An extra love point to give to someone.",
            price: 100,
            emoji: ":hearts:",
            useImmediately: true
        });
    }

    use(msg)
    {
        msg.author.loves += 1;
        super.use(msg);
        msg.channel.send(":convenience_store: You succesfully purchased an extra love point " + this.emoji + "\nYou can use it with `" + msg.guild.prefix + "love user`.");
    }
}