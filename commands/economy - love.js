const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class Love extends DBF.Command{
    constructor(){
        super({
             name: "love", //is pretty much just another trigger, but can be used filter commands.
             triggers: [], //any message (excluding prefix) that will trigger this command.
             group: "Economy", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Give someone one of your love points.  You get 2 points to give away every 6 hours, which can be redeemed by the recipient for up to 25 rice.", //this will show in the help message
             example: ">>love @user\n>>love username",             
             guildOnly : true, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqUser: true
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        
        let lover = msg.author;
        
        if(lover.loves == null) //if the author doesnt have any smacks.
            lover.loves = 2; 
        else if(lover.refreshLoves <= new Date().getTime()) //if the author is due for his smacks to be reset.
            lover.loves = 2;
        if(!user)
            if(lover.loves == 0)
                return msg.reply("Sorry love, you're all outta love.  Don't worry, you're getting more in "+ getTimeString(lover.refreshLoves));            
            else if(lover.loves == 1)
                return msg.reply("You have `1` love point left.  You're due to get more in "+ getTimeString(lover.refreshLoves));
            else
                return msg.reply("You've still got all of your love!");    
        else if(lover.loves == 0) //if the author is out of smacks.
            return msg.reply("You've used up all of your love. Don't worry, you're getting more in " + getTimeString(lover.refreshLoves));
        else if(lover == user)
            return msg.reply("You can't love yourself, that'd just be sad.");
        else if(user.id == msg.client.user.id)
            return msg.reply("I'm not that kind of bot ...");
        else if(user.bot)
            return msg.reply("What's an emotionless bot gonna do with your love?");
        
        let rep = Math.floor(Math.random() * 34) + 1;
        msg.channel.send(lover + " gave " + user + " one of their love points! They redeemed it for `" + rep + "` grains of rice.");
        
        if(lover.loves == 2)
            lover.refreshLoves = new Date().getTime() + 21600000;
        lover.loves-=1;
        if(!user.rep)
            user.rep = 0;
        user.rep += rep;
        
        msg.client.syncUser(lover);
        msg.client.syncUser(user);
        
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