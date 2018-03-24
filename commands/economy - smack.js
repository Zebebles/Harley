const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class Smack extends DBF.Command{
    constructor(){
        super({
             name: "smack", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["slap", "spank"], //any message (excluding prefix) that will trigger this command.
             group: "Economy", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Slap someone for being naughty! A slap can cause someone to drop up to 15 grains of rice, letting you pick up as many as you can.", //this will show in the help message
             example: ">>slap @user\n>>slap username",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqUser: true
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        
        let smacker = msg.author;
        
        if(smacker.smacks == null) //if the author doesnt have any smacks.
            smacker.smacks = 2; 
        else if(smacker.refreshSmacks <= new Date().getTime()) //if the author is due for his smacks to be reset.
            smacker.smacks = 2;
        if(!user)
            if(smacker.smacks == 0)
                return msg.channel.send("**" + msg.member.displayName + "**, you don't have any slaps.  They're due to reset in "+ getTimeString(smacker.refreshSmacks)).catch(err => console.log(err));         
            else if(smacker.smacks == 1)
                return msg.channel.send("**" + msg.member.displayName + "**, you have *1* slap left.  They're due to reset in "+ getTimeString(smacker.refreshSmacks)).catch(err => console.log(err));
            else
                return msg.channel.send("**" + msg.member.displayName + "**, you still have both of your slaps available and ready!").catch(err => console.log(err));
        else if(smacker.smacks == 0) //if the author is out of smacks.
            return msg.channel.send("**" + msg.member.displayName + "**, you can't slap anyone for " + getTimeString(smacker.refreshSmacks)).catch(err => console.log(err));
        else if(smacker == user)
            return msg.channel.send("**" + msg.member.displayName + "**, have you every tried slapping yourself?").catch(err => console.log(err));
        else if(user.bot)
            return msg.channel.send("**" + msg.member.displayName + "**, bot's don't have a face to slap, silly!").catch(err => console.log(err));
        

        if(smacker.smacks == 2)
            smacker.refreshSmacks = new Date().getTime() + 21600000;
        smacker.smacks-=1;
        if(!user.rep)
            user.rep = 0;
        
        let rep = (Math.floor(Math.random(new Date().getTime()) * 25) + 1);                    
        let lost = rep > user.rep ? user.rep : rep;
        let gained = Math.ceil(lost * Math.random(new Date().getTime()+1000));
        user.rep -= lost;
        smacker.rep += gained;

        msg.client.syncUser(smacker);
        msg.client.syncUser(user);

        msg.channel.send(smacker + ", you slapped " + user + " so hard that they dropped `" + lost + "` grains of rice! :open_mouth:. You managed to salvage `" + gained + "` grains, but lost the rest in the dirt.")
            .catch(err => console.log(err));

        
        function getTimeString(time){
            var delta = (time - new Date().getTime())/1000;
            var hours = Math.floor(delta / 3600) % 24;
            delta -= hours * 3600;
            var minutes = Math.floor(delta / 60) % 60;
            delta -= minutes * 60;
            var seconds = Math.round(delta % 60);			
    
            return "**"+ hours + "** hours **" + minutes + "** minutes and **" + seconds + "** seconds";
        }
    }
}