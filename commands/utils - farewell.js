const DBF = require('discordjs-bot-framework');

module.exports = class prefix extends DBF.Command{
    constructor(){
        super({
             name: "farewell", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["goodbye", "setfarewell"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             description: "Set or check the message that Harley will see people off with", //this will show in the help message
             example: ">>farewell Bye $mention | $name$! There are now $count$ members in $server$\n>>farewell\n>>farewell none",             
             reqArgs: true,
             guildOnly: true,
             reqUserPerms: ["MANAGE_GUILD"]
        });
    }

    run(params = {"msg": msg, "args": args, "user" : user}){ //all the code for your command goes in here.
        let msg = params.msg; var args = params.args;
        if(!args && msg.guild.farewell && msg.guild.greetChannel){
            var example = msg.guild.farewell.replace(/\$server\$/gi, msg.member.guild.name)
                .replace(/\$name\$/gi, msg.member.displayName)
                .replace(/\$mention\$/gi, "<@" + msg.member.user.id + ">")
                .replace(/\$count\$/gi, msg.member.guild.members.size);
            return msg.channel.send("This server has a farewell set-up.  You can remove it with `"+msg.guild.prefix+"farewell none`\nThis is what it'll look like when someone leaves the server:")
                    .then(() => msg.channel.send(example).catch(err => console.log(err)))
                    .catch(err => console.log(err));;
        }
        else if(!args)
            return msg.channel.send("There is no server farewell message yet.  \nUse `" + msg.guild.prefix + "farewell Bye $mention$ | $name$.  $count$ members in $server$` or similar to set it.").catch(err => console.log(err));
        else if(args.trim() == "none"){
            msg.client.dropFarewell(msg.guild);
            msg.channel.send("Farewell successfully removed.").catch(err => console.log(err));
        }
        else{
            args = args.replace(/[^a-zA-Z0-9\|\[\]\{\}\-\=\_\+\(\)\*\&\^\%\$\#\@\!\~\;\:\,\.\/\?\>\< ]/g, "");
            if(args.length > 150)
                return msg.channel.send("Server farewell message must be less than 150 characters long.").catch(err => console.log(err));
            msg.client.setFarewell(msg, args);
            var example = args.replace(/\$server\$/gi, msg.member.guild.name)
                .replace(/\$name\$/gi, msg.member.displayName)
                .replace(/\$mention\$/gi, "<@" + msg.member.user.id + ">")
                .replace(/\$count\$/gi, msg.member.guild.members.size);
            msg.channel.send("Farewell successfully set! Here's what it'll look like when someone leaves the server:")
            .then(() => msg.channel.send(example).catch(err => console.log(err)))
            .catch(err => console.log(err));;
        }
    }
}