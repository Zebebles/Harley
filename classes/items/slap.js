const Item = require("../item.js");

module.exports = class SlapItem extends Item{
    constructor () // {id - int, name - string, description - string, price - int, emoji - string, args - string, useImmediately - bool}
    {
        super({
            id: 1,
            name: "Slap",
            description: "An extra slap to use on who you please.",
            price: 100,
            emoji: ":hand_splayed:",
            useImmediately: true
        });
    }

    use(msg)
    {
        msg.author.loves += 1;
        super.use(msg);
        msg.channel.send(":convenience_store: You succesfully purchased an extra slap " + this.emoji + "\nYou can use it with `" + msg.guild.prefix + "slap user`.");
    }
}