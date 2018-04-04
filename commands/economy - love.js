const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");

module.exports = class Love extends DBF.Command{
    constructor(){
        super({
             name: "love", //is pretty much just another trigger, but can be used filter commands.
             triggers: [], //any message (excluding prefix) that will trigger this command.
             group: "Economy", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Give someone one of your love points.  A love point can be redeemed by your lover for up to 50 rice.", //this will show in the help message
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
                return msg.channel.send("**" + msg.member.displayName + "**, you're all outta love. :clock1: "+ getTimeString(lover.refreshLoves)).catch(err => console.log(err));        
            else if(lover.loves == 1)
                return msg.channel.send("**" + msg.member.displayName + "**, you have *1* love point left. :clock1: "+ getTimeString(lover.refreshLoves)).catch(err => console.log(err));
            else
                return msg.channel.send("**" + msg.member.displayName + "**, you've still got both of your love points!").catch(err => console.log(err));
        else if(lover.loves == 0) //if the author is out of smacks.
            return msg.channel.send(":no_entry: **" + msg.member.displayName + "**, you've used up all of your love. :clock1: " + getTimeString(lover.refreshLoves)).catch(err => console.log(err));
        else if(lover == user)
            return msg.channel.send(":no_entry: **" + msg.member.displayName + "**, you can't love yourself!").catch(err => console.log(err));
        else if(user.id == msg.client.user.id)
            return msg.channel.send(":no_entry: **" + msg.member.displayName + "**, noooo thank you.").catch(err => console.log(err));
        else if(user.bot)
            return msg.reply("There's not a lot that a bot can do with that.").catch(err => console.log(err));
        
        let rep = Math.floor(Math.random() * 50) + 1;
        msg.channel.send(":hearts: **" + lover.username + "** gave " + user + " a love point! They redeemed it for `" + rep + "` rice.").catch(err => console.log(err));
        
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
    
            return "**"+ hours + "**h **:" + minutes + "**m **:" + seconds + "** s";
        }
    }
}