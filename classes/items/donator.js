const Item = require("../item.js");

module.exports = class DonatorItem extends Item{
    constructor () // {id - int, name - string, description - string, price - int, emoji - string, args - string, useImmediately - bool}
    {
        super({
            id: 3,
            name: "Donator",
            description: "Full donator status for 1 month.",
            price: 7500,
            emoji: ":money_with_wings:",
            useImmediately: false,
        });
    }

    use(msg)
    {     
        msg.author.donationTier = 3;
        msg.author.donationExpires = new Date().getTime() + 2592000000;

        msg.client.guilds.get("317548490928422912").fetchMember(msg.author).then(mem => {
            mem.addRole("429277146519830529");
        }).catch(err => err);
        
        super.use(msg);
        msg.channel.send(`${this.emoji} You successfully redeemed your donator status, you now have access to all donator privileges for 30 days!`
                        + `\nFor a full list of these privileges, see the **Legend** package here **<http://www.harleybot.me/donate/>**`
                        + `\nIf you haven't already, don't forget to join the Discord server to claim your Donator role. **<https://discord.gg/Wy5AjGS>**`);
    }
}