const Socket = require("../Socket.js");

module.exports = class childSocket extends Socket
{
    constructor(client)
    {
        const name = "load_user";
        
        const fn = (id) => 
            client.loadUser(client.users.fetch(id));

        super(client, name, fn);
    }
}