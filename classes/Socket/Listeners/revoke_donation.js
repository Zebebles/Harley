const Socket = require("../Socket.js");
const Discord = require("discord.js");

module.exports = class childSocket extends Socket
{
    constructor(client)
    {
        const name = "revoke_donation";
        
        const fn = (id, fn) => 
            client.fetchUser(id).then(user => {
                if(!user)
                    return fn(false);
                else
                    fn(true);
                user.donationTier = -1;
                user.donationExpires = -1;

                client.guilds.get("317548490928422912").fetchMember(user).then(mem => {
                    mem.removeRoles(["429277014718021644","429277146519830529"]);
                }).catch(err => console.log("Error fetching member when revoking donation status: " + err));
                user.send("Your donation has expired");
                client.syncUser(user);
        }).catch(err => {
            console.log("Error fetching user when revoking donation status: " + err);
            fn(false);
        });

        super(client, name, fn);
    }
}