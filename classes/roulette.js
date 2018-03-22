const Discord = require("discord.js");
const Promise = require("bluebird");

module.exports = class Roulette{

    constructor (channel){
        this.red = {users: new Array(), pool: 0, emoji: "🔴", chance: 0.467, multiplier: 2}
        this.green = {users: new Array(), pool: 0, emoji: "<:green_circle:423631556288970767>", chance: 0.066, multiplier: 14}
        this.black = {users: new Array(), pool: 0, emoji : "⚫",chance: 0.467, multiplier: 2}
        this.channel = channel;        
    }

    addPlayer(user){
        let u = this.channel.guild.client.users.get(user.id);
        u.rep -= user.bet;
        let embed = new Discord.RichEmbed();

        if(user.team.toLowerCase() == "red"){
            this.red.users.push({name: user.name, id: user.id, bet: user.bet});
            this.red.pool += user.bet;
            embed.setColor([255,0,0]);
        }
        else if(user.team.toLowerCase() == "green"){
            this.green.users.push({name: user.name, id: user.id, bet: user.bet});
            this.green.pool += user.bet;
            embed.setColor([0,255,0]);
        }
        else if(user.team.toLowerCase() == "black"){
            this.black.users.push({name: user.name, id: user.id, bet: user.bet});
            this.black.pool += user.bet;
            embed.setColor([0,0,0]);
        }
        embed.setAuthor(user.name + " entered the Roulette", u.displayAvatarURL)
        embed.addField("Team", user.team[0].toUpperCase() + user.team.substr(1,user.team.length-1).toLowerCase(), true);
        embed.addField("Bet", user.bet,true);
        u.lastMessage.delete(5000);
        this.updateMessage().then(() => this.channel.send("", {embed}).then(m => m.delete(5000))).catch(err => console.log(err));
    }

    updateMessage(){
        return new Promise((resolve, reject) => {
            if(!this.message)
                this.channel.send("", {embed: this.buildMessage()}).catch(() => resolve()).then(m => this.message = m).then(() => resolve());
            else
                this.message.edit("", {embed: this.buildMessage()}).catch(err => {
                    this.channel.send("", {embed: this.buildMessage()}).then(() => resolve()).catch(() => resolve());
                }).then(() => resolve());
        });
    }

    userIn(id){
        if(this.red.users.find(u => u.id == id) || this.black.users.find(u => u.id == id) || this.green.users.find(u => u.id == id))
            return true;
        else
            return false;
    }

    buildMessage(winner){
        var embed = new Discord.RichEmbed();
        if(winner){ //build winner message
            embed.setTitle(winner.emoji + " Rice Roulette - Finished");
            let winnersString = "";
            winner.users.forEach(u => winnersString += "\n`" + u.name + "`");
            winnersString = winnersString.substr(1,winnersString.length);
            
            if(winner.emoji == this.red.emoji)
                embed.setColor([255,0,0]);
            else if(winner.emoji == this.green.emoji)
                embed.setColor([0,255,0]);
            else
                embed.setColor([0,0,0]);
            
            if(winnersString != "")
                embed.addField("Winners", winnersString,true);
            else
                embed.addField("Winners", "None",true);            
            embed.addField("Total winnings", winner.pool * winner.multiplier,true);
        }else{ //build in progress message  
            embed.setTitle("🎲 Rice Roulette - Spinning in 30 seconds!");
            embed.setDescription("Roulette started!! Type `" + this.channel.guild.prefix + "roulette color bet` to join!\n");
            embed.setColor(this.channel.guild.me.displayColor);
            embed.addField("Red " + this.red.emoji, "**Pool:** " + this.red.pool + "\n**Chance:** " + (this.red.chance*100).toFixed(1) + " %\t**Multiplier:** " + this.red.multiplier + "\n**Players:** " + this.red.users.length, true);
            embed.addField("Green " + this.green.emoji, "**Pool:** " + this.green.pool + "\n**Chance:** " + (this.green.chance*100).toFixed(1) + " %\t**Multiplier:** " + this.green.multiplier + "\n**Players:** " + this.green.users.length, true);
            embed.addField("Black " + this.black.emoji, "**Pool:** " + this.black.pool + "\n**Chance:** " + (this.black.chance*100).toFixed(1) + " %\t**Multiplier:** " + this.black.multiplier + "\n**Players:** " + this.black.users.length, true);
        }
        return embed;
    }

    draw(){
        return new Promise((resolve, reject) => {
            var val = Math.random();
            var winner;
            if(val < this.red.chance)
                winner = this.red;
            else if(val < this.red.chance+this.green.chance)
                winner = this.green;
            else
                winner = this.black;
            
            winner.users.forEach(u => {
                let user = this.channel.guild.client.users.get(u.id);
                if(!user)
                    return;
                user.rep += u.bet*winner.multiplier;
            });

            if(!this.message)
                this.channel.send("", {embed: this.buildMessage(winner)}).catch(() => resolve()).then(m => this.message = m).then(() => resolve());
            else
                this.message.edit("", {embed: this.buildMessage(winner)}).catch(err => {
                    this.channel.send("", {embed: this.buildMessage(winner)}).then(() => resolve()).catch(() => resolve());
                }).then(() => resolve());

            this.red.users.forEach(u => {
                let user = this.channel.guild.client.users.get(u.id);
                this.channel.guild.client.syncUser(user)
            });
            this.green.users.forEach(u => {
                let user = this.channel.guild.client.users.get(u.id);
                this.channel.guild.client.syncUser(user)
            });
            this.black.users.forEach(u => {
                let user = this.channel.guild.client.users.get(u.id);
                this.channel.guild.client.syncUser(user)
            });

        });
    }

}