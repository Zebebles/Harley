const DBF = require('discordjs-bot-framework');

module.exports = class prefix extends DBF.Command{
    constructor(){
        super({
             name: "autoRole", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["autorole", "setrole"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             description: "Set or check the role that will be auto-assigned to new members", //this will show in the help message
             example: ">>autorole guests\n>>autorole none\n>>autorole",             
             reqArgs: true,
             reqUserPerms: ["MANAGE_GUILD"],
             reqBotPerms: ["MANAGE_ROLES"]
        });
    }

    run(params = {"msg": msg, "args": args, "user" : user}){ //all the code for your command goes in here.
        let msg = params.msg; var args = params.args;
        if(!args && msg.guild.autoRole)
            msg.channel.send("The auto role for this server is `" + msg.guild.roles.get(msg.guild.autoRole).name + "`.\nUse `" + msg.guild.prefix + "autorole none` to remove it.");
        else if(!args && !msg.guild.autoRole)
            msg.channel.send("There is not currently an auto role for this server. Use `" + msg.guild.prefix + "command autorole` for details on how to set one.");
        else{
            if(args.trim().toLowerCase() == "none" || args.trim().toLowerCase() == "remove" || args.trim().toLowerCase() == "everyone"){
                msg.client.dropAutoRole(msg.guild);
                msg.channel.send("Successfully removed auto role.").catch(err => console.log(err));
            }else{
                let role;
                if(msg.mentions.roles)
                    role = msg.mentions.roles.first();
                if(!role)
                    role = msg.guild.roles.find(r => r.name.toLowerCase().includes(args.toLowerCase()));
                if(!role)
                    return msg.channel.send("I couldn't find any roles under `" + args + "`");
                if(msg.guild.me.highestRole.position < role.position)
                    return msg.channel.send("I need to have a role that is ordered above `" + role.name + "` to add people to it.").catch(err => console.log(err));
                else if (role.managed)
                    return msg.channel.send("I can't add people the role `" + role.name + "`");
                msg.client.setAutoRole(role);
                msg.channel.send("Auto role successfully set to `" + role.name + "`!").catch(err => console.log(err));
            }
        }
    }
}