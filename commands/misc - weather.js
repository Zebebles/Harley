const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");
const weather = require("weather-js");

module.exports = class Weather extends DBF.Command{
    constructor(){
        super({
             name: "weather", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["weather", "wthr", "forecast"], //any message (excluding prefix) that will trigger this command.
             group: "Misc", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Check the weather for any location.", //this will show in the help message
             example: ">>weather melbourne",             
             guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs : true,
             reqBotPerms: ["ATTACH_FILES"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        if(!args || args == "") return msg.channel.send("Usage: `weather Melbourne`").catch(err => console.log(err));

        var Canvas = require('canvas')
        , canvas = new Canvas(800, 175) //150 height, each day gets 100 width plus a gap of 20 between each day. 
        , ctx = canvas.getContext('2d');

        //WEATHER ICONS
        let icons = {
              "cloudy" : __dirname + "/../resources/icons/cloudy.png",
              "fog" : __dirname + "/../resources/icons/fog.png",
              "hot" : __dirname + "/../resources/icons/hot.png",
              "ice" : __dirname + "/../resources/icons/ice.png",
              "mostly_sunny" : __dirname + "/../resources/icons/mostly_sunny.png",
              "partly_sunny" : __dirname + "/../resources/icons/partly_sunny.png",
              "rain" : __dirname + "/../resources/icons/rain.png",
              "showers" : __dirname + "/../resources/icons/showers.png",
              "sleet" : __dirname + "/../resources/icons/sleet.png",
              "snowy" : __dirname + "/../resources/icons/snowy.png",
              "sunny" : __dirname + "/../resources/icons/sunny.png",
              "thunderstorm" : __dirname + "/../resources/icons/thunderstorm.png",
              "wind" : __dirname + "/../resources/icons/wind.png",              
            }

        //SEARCH WEATHER
        weather.find({search: args, degreeType: "C"}, function(err, result) {
            if(err || !result || result.length < 1){
                return msg.channel.send("Could not find weather for **" + args + "**").catch(err => console.log(err));
            }
            result = result[0];
            ctx.fillStyle = "#ffffff";

            for(let i = 1; i < 4; i++)
                ctx.fillRect(160 * i,10, 1, 155); //draw lines that will seperate each column

            //CURRENT DAY        
            let img = new Canvas.Image;
            img.src = getIcon(parseInt(result.current.skycode));
            ctx.drawImage(img, 45, 47.8, 70, 70);
            ctx.font = "25px Arial Bold";
            ctx.fillText("Today", 80 - ctx.measureText("Today").width / 2, 30);
            ctx.font = "35px Arial Bold";            
            ctx.fillText(result.current.temperature + "\u00B0", 80 - ctx.measureText(result.current.temperature + "\u00B0").width / 2, 160);
            ctx.font = "25px Arial Bold";            
            ctx.fillText(result.forecast[1].low + "\u00B0", 25 - ctx.measureText(result.forecast[1].low + "\u00B0").width / 2, 160);
            if(result.current.temperature < result.forecast[1].high)
                ctx.fillText(result.forecast[1].high + "\u00B0", 137.5 - ctx.measureText(result.forecast[1].high + "\u00B0").width / 2, 160);
            else            
                ctx.fillText(result.current.temperature + "\u00B0", 137.5 - ctx.measureText(result.current.temperature + "\u00B0").width / 2, 160);            
            //END CURRENT DAY

            //NEXT 4 DAYS
            for(let i = 2; i < 5; i++){                       
                ctx.font = "25px Arial Bold";                
                ctx.fillText(result.forecast[i].day, (80 - ctx.measureText(result.forecast[i].day).width / 2) + (160 * (i-1)), 30);
                img.src = getIcon(parseInt(result.forecast[i].skycodeday));
                ctx.drawImage(img, 45 + (160 * (i-1)), 47.5, 70, 70);
                ctx.font = "25px Arial Bold";  
                ctx.fillText(result.forecast[i].low + "\u00B0", (160 * (i-1)) + 50 - ctx.measureText(result.forecast[i].low + "\u00B0").width / 2, 160);
                ctx.fillText(result.forecast[i].high + "\u00B0", (160 * (i-1)) + 112.5 - ctx.measureText(result.forecast[i].high + "\u00B0").width / 2, 160);                           
            }

            img = new Discord.Attachment(canvas.toBuffer(), "weather.png");
            msg.channel.send("Here's the weather for **" + result.location.name + "**", img).catch(err => console.log(err));
        });

        function getIcon(skycode){
            switch(skycode){
                //THUNDERSTORM
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 37:
                case 35:
                case 38:
                case 47:
                case 17:
                    return icons.thunderstorm;
                    break;
                //SNOW
                case 5:
                case 14:
                case 15:
                case 16:
                case 7:
                case 10:
                case 41:
                case 42:
                case 43: 
                case 46:
                    return icons.snowy;
                    break;                    
                //SLEET
                case 6:
                    return icons.sleet;
                    break;                    
               //ICE
                case 8:
                case 25:
                    return icons.ice;
                    break;                    
                //SHOWERS
                case 18:
                case 45:
                case 11:                                
                case 9:                
                case 40:
                    return icons.showers;
                    break;                    
                //RAIN
                case 12:
                case 39:
                case 45:
                    return icons.rain;
                    break;                    
                //DUST / FOG / HAZE / FLURRIES
                case 19:
                case 20:
                case 21:
                case 22:
                case 13:
                    return icons.fog;
                    break;                    
                //WINDY
                case 23:
                case 24:
                    return icons.wind;
                    break;                    
                //CLOUDY
                case 26:
                    return icons.cloudy;
                    break;                    
                //MOSTLY CLOUDY / PARTLY SUNNY
                case 27:
                case 28:
                case 30:                
                    return icons.partly_sunny;
                    break;                    
                //PARTLY CLOUDY / MOSTLY SUNNY
                case 29:
                case 33:
                case 34:
                    return icons.mostly_sunny;
                    break;                    
                //SUNNY
                case 31:
                case 32:
                    return icons.sunny;
                    break;                    
                //HOT
                case 36:
                    return icons.hot;
                    break;                    
                //DEFAULT
                default:
                    return icons.sunny;
                    break;                    
            }
        }
    }
}