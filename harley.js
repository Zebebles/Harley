const myClient = require("./classes/Client.js"), SocketManager = require("./classes/Socket/SocketManager.js")
, HarassManager = require("./classes/Store/harassManager.js"), Store = require("./classes/Store/store.js");
let auth = require("./resources/auth.json");

let socketManager = new SocketManager('https://www.harleybot.me:8443/server/bot?password=' + auth.password);

socketManager.connect().then(auth => {
    
    let bot = new myClient({
        author: "221568707141435393", //this is used to check if the message was sent by the bot creator for ownerOnly commands
        prefix: ">>", //this is used as the prefix for any command your bot will respond to.  The bot will also respont to @mentions followed by command triggers.
        cmddir: require('path').join(__dirname, 'commands'), //this is the directory of your command folder.
        token: auth.mildredtoken, //this is your bots token.  It is used to log in as the client, and hence, should not be shared.
        MentionsTrigger: true
    });
    bot.auth = auth;
    bot.socketManager = socketManager;
    bot.socketManager.client = bot;
    bot.otherCommands = [];

    bot.on("missingPermissions", data => {
        if(data.bot)
            data.message.channel.send("I need permissions `" + data.permissions.join(', ') + "` to be able to that.");
        else
            data.message.channel.send("You need permissions `" + data.permissions.join(', ') + "` if you want me to do that." )
    });

    bot.on("ownerCommandTried", (command,msg) => {
        msg.channel.send("The command `" + command.name + "` is only avaliable for my developers.")
    });

    bot.on("commandError", data => {
        console.log("Error running command " + data.command.name + " in " + data.message.guild.name + "\n" + data.error);
    }); 

    bot.on('commandsReloaded', () => {
        setTimeout(() => 
            bot.socketManager.sendCommands(),500);
    });

    bot.on("ready", () =>
    {
        console.log("Test");
        bot.loadGuilds(bot.guilds.array())
        console.log("Loaded guilds from DB");
        bot.loadUsers(bot);
        bot.store = new Store();
        bot.harassManager = new HarassManager(bot);

        bot.user.setPresence({game : {name: bot.prefix + "help"}});

        bot.socketManager.sendCommands();
        bot.socketManager.sendStatus(false);
    });

}).catch(err => console.log("Couldn't connect to websocket\n" + err));