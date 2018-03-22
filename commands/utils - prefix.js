const DBF = require('discordjs-bot-framework');

module.exports = class prefix extends DBF.Command{
    constructor(){
        super({
             name: "prefix", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["prefix", "setPrefix"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             description: "Set or check the server prefix.", //this will show in the help message
             example: ">>prefix\n>>prefix new_prefix",                          
             reqArgs: true,
             guildOnly: true,
             reqUserPerms: ["MANAGE_GUILD"]             
        });
    }

    run(params = {"msg": msg, "args": args, "user" : user}){ //all the code for your command goes in here.
        let msg = params.msg; var args = params.args;
        if(!args)
            msg.channel.send("The prefix for this server is `" + msg.guild.prefix + "`.").catch(err => console.log(err));
        else{
            args = args.replace(/['"`]/g);
            if(args.length > 3)
                return msg.channel.send("Custom prefixes must be between 1 and 3 characters in length.").catch(err => console.log(err));
            let old = msg.guild.prefix;
            msg.client.setPrefix(msg.guild, args);
            msg.channel.send("Prefix successfully changed from `" + old + "` to `" + args +"`").catch(err => console.log(err));;
        }
    }
}