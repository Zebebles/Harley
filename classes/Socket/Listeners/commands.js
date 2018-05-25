const Socket = require("../Socket.js");

module.exports = class childSocket extends Socket
{
    constructor(client)
    {
        const name = "commands";
        
        const fn = (commands) => 
        {
            client.otherCommands = commands.filter(cmd => client.commands.find(c => c.areYou(cmd.name)));
            console.log(client.otherCommands);       
        };

        super(client, name, fn);
    }
}