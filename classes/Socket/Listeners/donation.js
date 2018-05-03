const Socket = require("../Socket.js");
const Discord = require("discord.js");

module.exports = class childSocket extends Socket
{
    constructor(client)
    {
        const name = "donation";
        
        const fn = (info, fn) => 
            client.fetchUser(info.id).then(user => {
                if(!user)
                    return fn(false);
                else
                    fn(true);
                let embed = new Discord.RichEmbed();
                let amount = 100 * info.amount;
                let tier = 1;
                embed.setAuthor("Donation receipt | " + user.username, user.displayAvatarURL);
                embed.addField("Amount", "$"+info.amount,true);
                if(info.amount >= 16)
                {
                    tier = 3;
                    amount += 500;
                    embed.setColor([219, 158, 28]);
                    embed.addField("Package", "Legend", true);
                } 
                else if(info.amount >=6)
                {
                    tier = 2;
                    amount += 250;                 
                    embed.setColor([172,0,230]);   
                    embed.addField("Package", "Friend", true);
                }
                else
                {
                    embed.setColor(0,142,193);
                    embed.addField("Package", "Supporter", true);
                }
                if(!user.donationTier || user.donationTier < tier)
                    user.donationTier = tier;
                if(user.donationExpires)
                    user.donationExpires = user.donationExpires += 2592000000;
                else
                    user.donationExpires = new Date().getTime() + 2592000000;
                
                embed.addField("Expires in", "**30** days");
                if(!user.rep)
                    user.rep = 0;
                user.rep += amount;
                client.syncUser(user);
                
                client.guilds.get("317548490928422912").fetchMember(user).then(mem => {
                    if(tier == 2)
                        mem.addRole("429277014718021644");
                    else if(tier == 3)
                        mem.addRole("429277146519830529");
                }).catch(err => err);
                
                user.send("Thanks for your donation!", {embed});
            }).catch(err => {
                fn(false);
                console.log(err);
            });

        super(client, name, fn);
    }
}