const Socket = require("../Socket.js");

module.exports = class childSocket extends Socket
{
    constructor(client)
    {
        const name = "reload";
        
        const fn = (cmd) => 
            client.reloadCommands(cmd);

        super(client, name, fn);
    }
}