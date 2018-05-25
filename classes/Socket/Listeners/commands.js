const Socket = require("../Socket.js");

module.exports = class childSocket extends Socket
{
    constructor(client)
    {
        const name = "commands";
        
        const fn = (commands) => 
        {
            const areYou = client.commands[0].areYou;
            client.otherCommands = commands.filter(cmd => !client.commands.find(c => c.areYou(cmd.name)));
            client.otherCommands.forEach(cmd => 
            {
                cmd.triggers = cmd.aliases.split(', ');
                cmd.areYou = areYou;
            });
        }
        super(client, name, fn);
    }
}