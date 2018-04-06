const Discord = require("discord.js");
const fs = require("fs");

module.exports = class HarassManager
{
    constructor(client)
    {
        this.client = client;
        this.roastCommand = client.commands.find(cmd => cmd.areYou("roast"));
        this.harassing = [];
        this.loadHarassing().then(() => {
            this.interval = setInterval(() => {
                this.harassing.forEach((harassee) => {
                    this.harass(harassee);
                });
                this.updateFile();
            },1000);
        }).catch(err => console.log(err));
    }

    loadHarassing()
    {
        return new Promise((resolve, reject) => {
            let harassing = require("../resources/harassing.json");
            if(harassing.length == 0)
                return reject();
            harassing.forEach(harassee => {
                this.client.fetchUser(harassee.userID).then(user => { //fetch the user from client
                    this.client.fetchUser(harassee.harasserID).then(harasser => {
                        if(user && harasser)
                        {
                            this.harassing.push({
                                guild: client.guilds.get(harassee.guildID), //get the guild
                                harassee:  user,
                                harrasser,
                                left: harassee.left //how many harasses the user has left.
                            });
                        }
                        if(harassing.indexOf(harassee) == harassing.length-1)
                            resolve();
                    }).catch(err => {
                        if(harassing.indexOf(harassee) == harassing.length-1)
                            resolve();
                    });
                }).catch(err => {
                    if(harassing.indexOf(harassee) == harassing.length-1)
                        resolve();
                });
            });
        })
        
    }

    startHarass(msg, user)
    {
        this.harassing.push({
            guild: msg.guild,
            harassee : user,
            harasser : msg.author,
            left: 10
        });
        
        /*
            start the harassment if this is the first harrass.
        */
        if(this.harrassing.length == 1)
            this.interval = setInterval(() => {
                this.harrassing.forEach(harrassee => {
                    this.harrass(harassee);
                });
                this.updateFile(); //update the file so that itll load the harass if the bot is downed.
            },1800000)
        else
            this.updateFile(); //update the file so that it'll load the harrass if the bot is downd
    }

    stopHarass(harassObj)
    {
        this.harassing.splice(this.harassing.indexOf(harassObj),1); //remove the harrass object from the array.

        if(this.harrassing.length == 0)
            clearInterval(this.interval); //stop the interval if there aren't any harrassings left.
    }

    harass(harassObj)
    {
        harassObj.left--;
        let channel = harassObj.guild.defaultTextChannel ? harrassObj.guild.defaultTextChannel : harassObj.harassee;


        if(harassObj.left == 0)
        {
            channel.send(harassObj.harassee + ", your mum gay.");
            this.stopHarass(harassObj);
        }
        else
        {
            roastCommand.run(
                {msg: 
                    {channel: channel}, //this was set above, the roast command will do channel.send(). 
                user: harassObj.harassee
            });    
        }
        this.updateFile();
    }

    updateFile()
    {
        let toWrite = this.harassing.map(harass => {
            return {userID : harass.harassee.id,
                    guildID : harass.guild.id,
                    left : harass.left,
                    harasserID: harass.harasser.id
                }
        });

        fs.writeFile("./resources/harassing.json", JSON.stringify(toWrite), function(err,res){
            if(err)
                console.log(err);
        });
    }
}