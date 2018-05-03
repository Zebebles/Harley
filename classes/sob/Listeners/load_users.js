const Socket = require("../Socket.js");

module.exports = class childSocket extends Socket
{
    constructor(client)
    {
        const name = "load_users";
        
        const fn = () => 
            client.loadUsers();

        super(client, name, fn);
    }
}