const Item = require("../item.js");

module.exports = class HarassItem extends Item{
    constructor () // {id - int, name - string, description - string, price - int, emoji - string, args - string, useImmediately - bool}
    {
        super({
            id: 2,
            name: "Harass",
            description: "Bully someone for 5 hours.",
            price: 5000,
            emoji: ":japanese_goblin:",
            useImmediately: false,
            args: '@user'
        });
    }

    use(msg)
    {
        let user = msg.client.findUser(msg);
        if(!user)
            return msg.channel.send(`${this.emoji} You need to tell me who you want harassed!\nUse \`${msg.guild.prefix}inv use harass @user\``);
        msg.client.harassManager.startHarass(msg, user);
        super.use(msg);
        msg.channel.send(`${this.emoji} Consider it done :wink:`);
    }
}