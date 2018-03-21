const DBF = require('discordjs-bot-framework');
const Discord = require("discord.js");
const rgbToHex = require("rgb-hex");
const hexToRgb = require("hex-rgb");

module.exports = class Color extends DBF.Command{
    constructor(){
        super({
             name: "color", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["color", "clr", "colour"], //any message (excluding prefix) that will trigger this command.
             group: "Misc", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "See what a color looks like!", //this will show in the help message
             example: ">>color hex or rgb\n>>color #059adf\n>>color 255,255,255",             
             guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs : true,
             reqBotPerms: ["ATTACH_FILES"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        let msg = params.msg; let args = params.args; let user = params.user;
        if(!args || args == "") return msg.channel.send("Usage: `clr #000000`");

        let hexRegex = new RegExp("([0-9a-f]{6}|[0-9a-f]{3})", "gi");
        let rgbRegex = new RegExp("(2[0-5]{2}|[0-1]?[0-9]{1,2})[, :.]+(2[0-5]{2}|[0-1]?[0-9]{1,2})[, :.]+(2[0-5]{2}|[0-1]?[0-9]{1,2})", "gi")
        let rgb = args.match(rgbRegex);
        let hex = args.match(hexRegex);
        if( (!hex || args.replace(hex,"").length != 0)  &&  !rgb   )
            return msg.channel.send("Color input must be in hex or rgb format. e.g `color #000000` or `color 255,255,255`");
                
        if(rgb)
        {
            hex = rgbToHex(parseInt(rgb[0].split(/[,:. ]+/g)[0].trim()),parseInt(rgb[0].split(/[,:. ]+/g)[1].trim()),parseInt(rgb[0].split(/[,:. ]+/g)[2].trim()));
            rgb = "rgb(" + rgb[0].replace(/[,:. ]+/g,", ") + ")";
        }
        else{
            hex = hex[0];
            rgb = hexToRgb("#"+hex);
            rgb = "rgb(" + rgb.red + ", " + rgb.green + ", " + rgb.blue + ")";
        }

        var Canvas = require('canvas')
        , canvas = new Canvas(100, 100)
        , ctx = canvas.getContext('2d');

        ctx.fillStyle = "#" + hex;
        ctx.fillRect(0,0,100,100);
        
        let img = new Discord.Attachment(canvas.toBuffer(), "color.png");

        msg.channel.send(`**HEX**\t\`#${hex}\`\n**RGB**\t\`${rgb}\``, img);

    }
}