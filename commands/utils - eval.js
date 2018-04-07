const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class changeGame extends DBF.Command{
    constructor(){
        super({
             name: "eval", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["eval"], //any message (excluding msg.client.Prefix) that will trigger this command.
             group: "Utils", //this command will come under this group in the automatic help message.
             ownerOnly : true, //if this command is to be used by the bot creator only.
             description: "run a js expression.", //this will show in the help message
             example: ">>eval expression",             
             guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs: true
        });
    }

    run(params = {"msg": msg, "args": args, "user" : user}){ //all the code for your command goes in here.
        let msg = params.msg; var args = params.args;
        let embed = new Discord.RichEmbed();
        embed.setTitle("Eval results.");
        embed.addField("Input","```javascript\n" + args + "```:arrow_down:");
        Promise.all([
            new Promise((resolve, reject) => {
                let ev;

                try {
                    ev = eval(args);

                    if (ev && typeof ev.then === 'function' && typeof ev.catch === 'function')   {
                        ev.then(resolve).catch(reject);
                        return;
                    }
                    resolve(ev);
                } catch (err) {
                    reject(err);
                }
            })
        ]).then(resolutions => {
            let out;
            const res = resolutions[0];
            if (typeof res === 'object' && typeof res !== 'string') {
                out = require('util').inspect(res);
                if (typeof out === 'string' && out.length > 1900) {
                    out = res.toString();
                }
            } else {
                out = res;
            }
            embed.addField(`Succeeded`,`\`\`\`js\n${out}\n\`\`\``);
            msg.channel.send("",{embed});
        }).catch(err => {
            embed.addField(`Failed`,`\`\`\`js\n${err.message || err}\`\`\``);
            msg.channel.send("",{embed});
        });
    }
}