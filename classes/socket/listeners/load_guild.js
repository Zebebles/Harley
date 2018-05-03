const Socket = require("../Socket.js");

module.exports = class childSocket extends Socket
{
    constructor(client)
    {
        const name = "load_guild";
        
        const fn = (id) => 
            client.loadGuilds([client.guilds.get(id)]);

        super(client, name, fn);
    }
}