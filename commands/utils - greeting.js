const DBF = require('discordjs-bot-framework');

module.exports = class prefix extends DBF.Command{
    constructor(){
        super({
             name: "greeting", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["greeting", "greet", "setgreeting", "setgreet"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             description: "Set or check the message that new members will be greeted with.", //this will show in the help message
             example: ">>greeting Welcome $mention$ | $name$! There are now $count$ members in $server$\n>>greeting\n>>greeting none",
             reqArgs: true,
             guildOnly: true,
             reqUserPerms: ["MANAGE_GUILD"]           
        });
    }

    run(params = {"msg": msg, "args": args, "user" : user}){ //all the code for your command goes in here.
        let msg = params.msg; var args = params.args;
        if(!args && msg.guild.greeting && msg.guild.greetChannel){
            var example = msg.guild.greeting.replace(/\$server\$/gi, msg.member.guild.name)
                .replace(/\$name\$/gi, msg.member.displayName)
                .replace(/\$mention\$/gi, "<@" + msg.member.user.id + ">")
                .replace(/\$count\$/gi, msg.member.guild.members.size);

            return msg.channel.send("This server has a greeting set-up.  You can remove it with `"+msg.guild.prefix+"greeting none`\nThis is what it'll look like when someone joins the server:").then(() => msg.channel.send(example));
        }
        else if(!args)
            return msg.channel.send("There is no server greeting yet.  \nUse `" + msg.guild.prefix + "greeting Welcome, $mention$|$name$.  $count$ members in $server$` or similar to set it.");
        else if(args.trim() == "none"){
            msg.client.dropGreeting(msg.guild);
            msg.channel.send("Greeting successfully removed.");
        }
        else{
            args = args.replace(/[^a-zA-Z0-9\|\[\]\{\}\-\=\_\+\(\)\*\&\^\%\$\#\@\!\~\;\:\,\.\/\?\>\< ]/g, "");
            if(args.length > 150)
                return msg.channel.send("Server greeting must be less than 150 characters long.");
            msg.client.setGreeting(msg, args);
            var example = args.replace(/\$server\$/gi, msg.member.guild.name)
                .replace(/\$name\$/gi, msg.member.displayName)
                .replace(/\$mention\$/gi, "<@" + msg.member.user.id + ">")
                .replace(/\$count\$/gi, msg.member.guild.members.size);
            msg.channel.send("Greeting successfully set! Here's what it'll look like when someone joins the server:").then(() => msg.channel.send(example));
        }
    }
}