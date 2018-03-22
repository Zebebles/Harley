const DBF = require('discordjs-bot-framework');
const Discord = require('discord.js');


module.exports = class Choose extends DBF.Command{
    constructor(){
        super({
             name: "teams", //is pretty much just another trigger, but can be used filter commands.
             triggers: ["teams", "team"], //any message (excluding msg.client.msg.client.Prefix) that will trigger this command.
             group: "Misc", //this command will come under this group in the automatic help message.
             ownerOnly : false, //if this command is to be used by the bot creator only.
             description: "Generates n teams from the list of names provided.", //this will show in the help message
             example: ">>teams 3 john, johny, johnson, janette, jan, johnette",             
             guildOnly : false, //any command that refers to a guild with the discord.js library will crash if it triggered in a dm channel.  This prevents that.
             reqArgs: true,
             reqBotPerms : ["EMBED_LINKS"]
        });
    }

    run(params = {"msg": msg, "args": args, "user": user}){ //all the code for your command goes in here.
        if(!params.args || params.args == "") return params.msg.channel.send("Usage: `" + params.msg.client.prefix + "choose opt1,opt2,opt3`").catch(err => console.log(err));
        
        let msg = params.msg; let args = params.args; let user = params.user;        
        let teamNames = [
            "Watermelon", "Banana", "Strawberry", "Grape", "Lemon", "Orange", "Pear", "Grapefruit", "Apricot", "Tangerine", "Coconut", "Blackberry", "Date", "Gooseberry", "Pomegranate", "Cantaloupe", "Cranberry"
            , "Olive", "Passion fruit", "Guava", "Raspberry", "Lime", "Kumquat", "Cat", "Dog", "Bird", "Squirrel", "Snake", "Gray wolf", "Horse", "Lion", "Pig", "Tiger", "Deer", "Bear", "Giraffe", "Cow",
            "Goat", "Donkey", "Raccoon", "Rhinoceros", "Turtle", "Leopard", "Sheep", "Duck", "Jellyfish", "Ferret", "Hare", "Cheetah", "Crow", "Camel", "Otter", "Goose", "Rat", "Armadillo", "Hedgehog", "Butterfly",
            "Gorilla", "Lizard", "Kitten", "Coyote", "Skunk", "Parrot", "Frog", "Baboon"
        ];
        let opts = args.match(/[\w\d ']*/g).filter(s => s != "");        
        var max = Math.floor(opts.length-1);
        var nTeams = parseInt(opts[0].match(/[\d]{1,}/g));
        let ppt = Math.floor((opts.length+1) / nTeams);
        let teams = new Array();
        opts[0] = opts[0].replace(/[\d]{1,}/g, "").trim();
        shuffle(opts);
        
        if(opts.length < 2) 
            return msg.channel.send("Usage: `" + msg.client.prefix + "choose opt1,opt2,opt3`").catch(err => console.log(err));
        if(!nTeams || isNaN(nTeams) || nTeams > teamNames.length || nTeams < 2)
            return msg.channel.send("You need to specify a number of teams between `2` and `" + teamNames.length + "` before you start listing members.").catch(err => console.log(err));
        else if(ppt <= 0)
            return msg.channel.send("There must be more players than teams.").catch(err => console.log(err));
        if(ppt == 0)
            nTeams = opts.length;

        for(let i = 0; i < nTeams; i++){
            teams.push({name: teamNames.filter(t => teams.find(te => t.name == te.name) == null)[Math.floor(Math.random() * teamNames.length)], members : new Array()});
            for(let b = 0; b < ppt; b++)
                teams[teams.length - 1].members.push(opts.pop());
        }

        if(opts.length != 0)
            teams[0].members.push(opts.pop());

        teams.forEach(function(t) {
            var myEmbed = new Discord.RichEmbed;
            myEmbed.setTitle("Team " + t.name);
			if(msg.guild)
                myEmbed.setColor(msg.guild.me.displayColor);
            else
                myEmbed.setColor([127, 161, 216]);           
            var message = "";
            t.members.filter(mem => mem != null).forEach(mem => message += "\n`" + mem.trim() + "`");
            myEmbed.setDescription(message);
            msg.channel.send("", {"embed":  myEmbed}).catch(err => console.log(err));
        });
        
        function shuffle(a) {
            var j, x, i;
            for (i = a.length; i; i--) {
                j = Math.floor(Math.random() * i);
                x = a[i - 1];
                a[i - 1] = a[j];
                a[j] = x;
            }
        }
    }
}