const Socket = require("../Socket.js");

module.exports = class childSocket extends Socket
{
    constructor(client)
    {
        const name = "load_guilds";
        
        const fn = () => 
            client.loadGuilds(client.guilds.array());

        super(client, name, fn);
    }
}