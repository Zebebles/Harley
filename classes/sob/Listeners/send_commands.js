const Socket = require("../Socket.js");

module.exports = class childSocket extends Socket
{
    constructor(client)
    {
        const name = "send_commands";
        
        const fn = () => 
            client.socketManager.sendCommands();

        super(client, name, fn);
    }
}