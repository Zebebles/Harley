const Socket = require("../Socket.js");

module.exports = class childSocket extends Socket
{
    constructor(client)
    {
        const name = "send_status";
        
        const fn = () => 
            client.socketManager.sendStatus(true);

        super(client, name, fn);
    }
}