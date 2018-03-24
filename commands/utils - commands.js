const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");


module.exports = class Commands extends DBF.Command{
    constructor(){
        super({
             name: "commands", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["cmds", "command", "cmd"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "See either a list of all commands, a more detailed list of commands from a specific group, or detailed information about a specific command.", //this will show in the help message
             example: ">>commands\n>>commands music\n>>commands play",                          
             reqArgs : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        let groups = new Array();
        let embed = new Discord.RichEmbed();
        let prefix;
        if(msg.guild && msg.guild.prefix)
            prefix = msg.guild.prefix;
        else 
            prefix = msg.client.prefix;
        embed.setColor([127, 161, 216]);
        
        msg.client.commands.forEach(cmd => { //populate groups array
            if(!groups.find(g => g == cmd.group))
                groups.push(cmd.group);
        });
        
        if(!args)
        { //if they want a list of all commands
            embed.setTitle("Available Comamnds");
            embed.setDescription("Use `" + prefix + "command group` for more detailed information about commands in a specific group, or `" +
                                prefix + "command command_name` for more detailed information about a specific command.\n\n");
            groups.forEach(group => {
                let message = "**" + group + "**\n";
                
                if(msg.author.id == msg.client.author)
                    msg.client.commands.filter(cmd => cmd.group == group).forEach(cmd => message += "`" + cmd.name + "`, ");
                else
                    msg.client.commands.filter(cmd => !cmd.ownerOnly && cmd.group == group).forEach(cmd => message += "`" + cmd.name + "`, ");

                embed.description += message.substr(0, message.length-2) + "\n\n";
            });
        
        }
        else if (groups.find(g => g.toLowerCase() == args.toLowerCase()))
        { //if they want a list of commands in a specific group.
            
            let group = groups.find(g => g.toLowerCase().includes(args.toLowerCase()));
            embed.setTitle(group);
            embed.setDescription("Use `" + prefix + "command command_name` for more detailed information about a specific command.\n\n");
            let message = "";
            
            if(msg.author.id == msg.client.author)
                msg.client.commands.filter(cmd => cmd.group == group).forEach(cmd => message += "**" + cmd.name + ":** " + cmd.description + "\n\n");
            else
                msg.client.commands.filter(cmd => !cmd.ownerOnly && cmd.group == group).forEach(cmd => message += "**" + cmd.name + ":** " + cmd.description + "\n\n");

            embed.description += (message);
        
        } 
        else if(msg.client.commands.find(cmd => cmd.areYou(args.toLowerCase())))
        { //if they want a specific command.
            
            let command = msg.client.commands.find(cmd => cmd.areYou(args.toLowerCase()));
            if(command.ownerOnly && msg.author.id != msg.client.author)
                return msg.channel.send("The command **" + command.name + "** is only available for my Developer.").catch(err => console.log(err));
            embed.setTitle("Command specific information");
            let guildOnly = "❌";
            if(command.guildOnly)
                guildOnly = "✓";
            let aliases = "";
            command.triggers.forEach(t => aliases += "`" + t + "`, ");
            aliases = aliases.replace("`" + command.name + "`,", "");
            if(aliases == "")
                aliases = "N/A";
            else
                aliases = aliases.substr(0, aliases.length-2);
            embed.setDescription("**Command Name:** " + command.name + "\n"
                                + "**Command Group:** " + command.group + "\n"
                                + "**Guild Only:** " + guildOnly + "\n"
                                + "**Aliases:** " + aliases + "\n"
                                + "**Description:** " + command.description.replace(">>", prefix) + "\n"
                                + "**Example:** `" + command.example.replace(">>", prefix).split("\n").join("`\n`") + "`");
        }
        else
            return msg.channel.send("Couldn't find any commands or groups under **" + args + "**.").catch(err => console.log(err));

        msg.channel.send("", {embed}).catch(err => console.log(err));
    }
}