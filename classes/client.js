const DBF = require("discordjs-bot-framework");
const Discord = require("discord.js");
const mysql = require("mysql");
const fetch = require("node-fetch");
const snekfetch = require("snekfetch");
var Promise = require("bluebird");
const auth = require('../resources/auth.json');
require("../unlisted/mysql_functions.js")();
require("../unlisted/joinleave.js")();//

class myClient extends DBF.Client {
    constructor(options = {}) {
        super(options);

        this.on("guildCreate", guild => {
            guild.defaultTextChannel = this.getDefaultChannel(guild);
            this.setPrefix(guild, guild.client.prefix);
            guild.disabledCommands = new Array();
            guild.channels.filter(ch => ch.type == "text").forEach(ch => ch.disabledCommands = new Array());

            let myEmbed = new Discord.RichEmbed();
            myEmbed.setColor([30, 216, 104]);
            myEmbed.setTitle("Server joined.");
            myEmbed.setDescription("**Guild name:** " + guild.name +
                "\n**Members:** " + guild.memberCount +
                "\n**Server count:** " + this.guilds.size);
            myEmbed.setFooter(new Date().toLocaleString("en-US", {
                "timeZone": "Australia/Melbourne"
            }));
            this.guilds.get("317548490928422912").channels.get("388501029303615490").send("", {
                "embed": myEmbed
            }).catch(err => console.log(err));
            this.sendStatus(false);            

            if(guild.defaultTextChannel)
                guild.defaultTextChannel.send("**Hey! Thanks for adding me! :robot:**\n"
                    +"**•**\tMy default prefix is `" + this.prefix + "`, but you can change it with `"+this.prefix+"prefix new_prefix`.\n"
                    +"**•**\tYou can view my commands with `" + this.prefix + "commands`, or visit my website for a searchable list.\n"
                    +"**•**\tCommands can be disabled either for the whole server or a specific channel with `" + this.prefix + "toggle cmd_name`. May I suggest disabling music in " + guild.defaultTextChannel + " :wink:\n"
                    +"**•**\tIf you wish to give new members a default role when they join the server, you can do so with `" + this.prefix + "autorole role_name`.\n"
                    +"**•**\tYou can also greet new members, and farewell leaving ones with `" + this.prefix + "greeting message` and `" + this.prefix + "farewell message` respectively.\n"                  
                    +"**•**\tIf you need any help, or have any issues/suggestions, you're always welcome in the support server!\n"
                    + "**<https://www.harleybot.me/commands>**");

            this.loadUsers(this);
        });

        this.on("channelCreate", channel => {
            channel.disabledCommands = new Array();
        });

        this.on("channelDelete", channel => {
            if (channel.disableCommands)
                channel.disabledCommands.forEach(cmd => this.enableCommand(channel.guild, channel.id, cmd));
        });

        this.on("guildDelete", guild => {
            var conn = mysql.createConnection({
                host: this.auth.webserver.split(":")[0],
                user: "root",
                password: this.auth.password
            });

            conn.connect(function (err) {
                removeGuild(conn, guild).catch(err => {
                    console.log(err);
                    conn.end();
                }).then((conn) => conn.end());
            });

            let myEmbed = new Discord.RichEmbed();
            myEmbed.setColor([247, 112, 79]);
            myEmbed.setTitle("Server left.");
            myEmbed.setDescription("**Server name:** " + guild.name +
                "\n**Members:** " + guild.memberCount +
                "\n**Server count:** " + this.guilds.size);
            myEmbed.setFooter(new Date().toLocaleString("en-US", {
                "timeZone": "Australia/Melbourne"
            }));
            this.guilds.get("317548490928422912").channels.get("388501029303615490").send("", {
                "embed": myEmbed
            }).catch(err => console.log(err));
            this.sendStatus(false);
        });

        this.on("guildMemberAdd", member => {
            if (member.guild.greeting && member.guild.greetChannel) {
                var channel = member.guild.channels.get(member.guild.greetChannel);
                var message = member.guild.greeting.replace(/\$server\$/gi, member.guild.name)
                    .replace(/\$name\$/gi, member.displayName)
                    .replace(/\$mention\$/gi, "<@" + member.user.id + ">")
                    .replace(/\$count\$/gi, member.guild.members.size);
                if (!channel)
                    this.dropGreeting(member.guild).then((conn) => {
                        this.dropFarewell(member.guild).then(conn => {
                            conn.end();
                        }).catch(err => {
                            console.log(err);
                            conn.end();
                        });
                    }).catch(err => {
                        console.log(err);
                        this.dropFarewell(member.guild).then(conn => {
                            conn.end();
                        }).catch(err => {
                            console.log(err);
                            conn.end();
                        });
                    });
                    else if(!channel.permissionsFor(channel.guild.me).has("SEND_MESSAGES"))
                        return;
                    else
                        channel.send(message).catch(err => console.log(err));
            }
            if(member.guild.autoRole && (member.guild.me.hasPermission("MANAGE_ROLES")||member.guild.me.hasPermission("ADMINISTRATOR")))
            {
                if(member.guild.roles.get(member.guild.autoRole))
                {
                    if(member.guild.me.highestRole.position > member.guild.roles.get(member.guild.autoRole).position)
                        member.addRole(member.guild.autoRole).catch(err => console.log("Error trying to add auto role for " + member.guild.name + ".  Role ID: " + member.guild.autoRole + "\n\n" + err));
                }
                else
                    member.client.dropAutoRole(member.guild);
            }
            if(member.guild.channels.filter(ch => ch.type == "text" && ch.topic).find(ch => ch.topic.toLowerCase().includes(member.guild.prefix + "join")))
                announceJoin(member);
            if(member.user.donationTier && member.guild.id == "317548490928422912")
            {
                if(member.user.donationTier == 2)
                    member.addRole("429277014718021644"); //donator
                else if(member.user.donationTier == 3)
                    member.addRole("429277146519830529"); //donator+
            }
            this.loadUser(member.user);
        });
        this.on("guildMemberRemove", member => {
            if (member.guild.farewell && member.guild.greetChannel) {
                var channel = member.guild.channels.get(member.guild.greetChannel);
                var message = member.guild.farewell.replace(/\$server\$/gi, member.guild.name)
                    .replace(/\$name\$/gi, member.displayName)
                    .replace(/\$mention\$/gi, "<@" + member.user.id + ">")
                    .replace(/\$count\$/gi, member.guild.members.size);
                if (!channel)
                    this.dropGreeting(member.guild).then((conn) => {
                        this.dropFarewell(member.guild).then(conn => {
                            conn.end();
                        }).catch(err => {
                            console.log(err);
                            conn.end();
                        });
                    }).catch(err => {
                        console.log(err);
                        this.dropFarewell(member.guild).then(conn => {
                            conn.end();
                        }).catch(err => {
                            console.log(err);
                            conn.end();
                        });
                    });
                else if(!channel.permissionsFor(channel.guild.me) || !channel.permissionsFor(channel.guild.me).has("SEND_MESSAGES"))
                    return;
                else
                    channel.send(message).catch(err => console.log(err));
            }
            if(member.guild.channels.filter(ch => ch.type == "text" && ch.topic).find(ch => ch.topic.toLowerCase().includes(member.guild.prefix + "join")) && member != member.guild.me)
                announceLeave(member);
        });
    }

    getDefaultChannel(guild)
    {
        if(guild.defaultRole.hasPermission("ADMINISTRATOR"))
            return guild.channels.filter(ch => ch.type == "text").sort((a,b) => a.position-b.position).first();
        else if(guild.defaultRole.hasPermission("SEND_MESSAGES"))
            return guild.channels.filter(ch => ch.type == "text" && ch.permissionsFor(guild.me).has("SEND_MESSAGES") && !ch.permissionOverwrites.find(overwrite => overwrite.id == guild.defaultRole.id && new Discord.Permissions(overwrite.deny).has("SEND_MESSAGES"))).sort((a,b) => a.position-b.position).first();
        else
            return guild.channels.filter(ch => ch.type == "text" && ch.permissionsFor(guild.me).has("SEND_MESSAGES") && ch.permissionOverwrites.find(overwrite => overwrite.id == guild.defaultRole.id && new Discord.Permissions(overwrite.allow).has("SEND_MESSAGES"))).sort((a,b) => a.position-b.position).first();
    }

    sendStatus(extended){
        
        let status = {
            status: this.user.presence.status,
            guilds: this.guilds.size,
            connections: this.voiceConnections.size,
            connlist: []
        };
        snekfetch.post(this.auth.webserver + "/servers/status")
                .send({status})
                .end()
                .catch(err => {
                    console.log("ERROR SENDING STATUS\n<br/>"+err);
                });
        return status;
    }

    sendLoadGuilds(id)
    {
        snekfetch.post(this.auth.webserver+"/servers/loadGuilds")
        .send({id})
        .end()
        .catch(err => console.log("Error sending reload guilds post" + err));
    }

    reRegister(){
        snekfetch.get(auth.webserver+"/servers/register?pw=" + auth.password).then(response => {
            if(response.status != 200)
                return console.log("Error re-registering server");
            snekfetch.get(auth.webserver + "/servers/auth").then(authResponse => {
                if(authResponse.status != 200)
                    return console.log("Error fetching auth.");
                    
                this.auth = JSON.parse(authResponse.text);
            }).catch(err => console.log("Error re-authorising)"));
        }).catch(err => console.log("Error re-registering server"));
    }

    loadUsers(client){
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0],
            user: "root",
            password: this.auth.password
        });
        
        conn.connect(function(err) {
            loadUsersDB(conn, client).then(conn => {
                console.log("Successfully loaded " + client.users.size + " users.");
            }).finally(() => {
                conn.end();
            }).catch(err => console.log("Error loading users.\n" + err));
        });
    }

    syncUser(user){
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0],
            user: "root",
            password: this.auth.password
        });
        let webserver = this.auth.webserver;
        if(!user.smacks)
            user.smacks = 0;
        if(!user.loves)
            user.loves = 0;
        if(!user.refreshLoves)
            user.refreshLoves = 0;
        if(!user.refreshSmacks)
            user.refreshSmacks = 0;
        if(!user.rep)
            user.rep = 0;
        if(!user.repRefresh)
            user.repRefresh = 0;
        conn.connect(function(err) {
            updateUser(conn, user).catch(err => {
                console.log("Error updating user " + user.username + ".\n" + err);
            }).finally(() => {
                conn.end();
                snekfetch.post(webserver + "/servers/updateUser")
                    .send({"id" : user.id})
                    .end()
                    .catch(err => {
                        console.log(err);
                    });
            });
        });
    }

    loadUser(user)
    {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0],
            user: "root",
            password: this.auth.password
        });

        conn.connect(function(err) {
            if(err)
                return console.log(err);
            loadUser(conn, user).catch(err => {
                console.log("Error loading user " + user.username + ".\n" + err);
            }).finally(() => {
                conn.end();
            });
        });
    }
    
    loadGuilds(guilds) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0],
            user: "root",
            password: this.auth.password
        });
        conn.connect(function (err) {
            loadPrefixes(conn, guilds).then(conn => {
                loadAutoRoles(conn, guilds).then(conn => {
                    loadGreetings(conn, guilds).then(conn => {
                        loadDisabledCommands(conn, guilds).then(conn => {
                            conn.end();
                        }).catch(err => {
                            console.log("Error: " + err);
                            conn.end();
                        });
                    }).catch(err => console.log(err)); //catch loadGreetings
                }).catch(err => console.log(err)); //catch loadAutoRoles
            }).catch(err => console.log(err)); //catch loadPrefixes
        });

        guilds.forEach(guild => {
            guild.defaultTextChannel = this.getDefaultChannel(guild);
        });
    } 

    setPrefix(guild, prefix) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0],
            user: "root",
            password: this.auth.password
        });

        conn.connect(function (err) {
            updateGuildPrefix(conn, guild, prefix).catch(err => {
                console.log(err);
                conn.end();
            }).then((conn) => {
                conn.end();
            });
        });
        this.sendLoadGuilds(guild.id);
    }

    setAutoRole(role) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0],
            user: "root",
            password: this.auth.password
        });

        conn.connect(function (err) {
            updateAutoRole(conn, role).catch(err => {
                console.log(err);
                conn.end();
            }).then((conn) => {
                conn.end();
            });
        })
        this.sendLoadGuilds(role.guild.id);
    }

    dropAutoRole(guild) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0],
            user: "root",
            password: this.auth.password
        });
        conn.connect(function (err) {
            removeAutoRole(conn, guild).catch(err => {
                console.log(err);
                conn.end();
            }).then((conn) => {
                conn.end();
            });
        })
        this.sendLoadGuilds(guild.id);
    }

    setGreeting(msg, greeting) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0],
            user: "root",
            password: this.auth.password
        });

        conn.connect(err => {
            setGreeting(conn, msg.guild, greeting).then(conn => {
                setGreetingChannel(conn, msg.guild, msg.channel.id).then(conn => {
                    conn.end();
                }).catch(err => {
                    console.log(err);
                    conn.end();
                });
            }).catch(err => {
                console.log(err);
                conn.end();
            });
        });
        this.sendLoadGuilds(guild.id);
    }

    setFarewell(msg, farewell) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0],
            user: "root",
            password: this.auth.password
        });

        conn.connect(err => {
            setFarewell(conn, msg.guild, farewell).then(conn => {
                setGreetingChannel(conn, msg.guild, msg.channel.id).then(conn => {
                    conn.end();
                }).catch(err => {
                    console.log(err);
                    conn.end();
                })
            }).catch(err => {
                console.log(err);
                conn.end();
            });
        });
        this.sendLoadGuilds(guild.id);
    }

    dropGreeting(guild) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0],
            user: "root",
            password: this.auth.password
        });

        conn.connect(err => {
            if (guild.farewell)
                removeGreeting(conn, guild).catch(err => {
                    console.log(err);
                    conn.end();
                }).then((conn) => {
                    conn.end()
                });
            else
                removeGuildFromGreetings(conn, guild).catch(err => {
                    console.log(err);
                    conn.end();
                }).then((conn) => {
                    conn.end()
                });
        });
        this.sendLoadGuilds(guild.id);
    }

    dropFarewell(guild) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0],
            user: "root",
            password: this.auth.password
        });

        conn.connect(err => {
            if (guild.greeting)
                removeFarewell(conn, guild).catch(err => {
                    console.log(err);
                    conn.end();
                }).then((conn) => {
                    conn.end()
                });
            else
                removeGuildFromGreetings(conn, guild).catch(err => {
                    console.log(err);
                    conn.end();
                }).then((conn) => {
                    conn.end()
                });
        });
        this.sendLoadGuilds(guild.id);
    }

    disableCommand(guild, channelId, commandName) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0],
            user: "root",
            password: this.auth.password
        });

        let sendLoadGuilds = this.sendLoadGuilds;
        conn.connect(err => {
            if (err) {
                return console.log(err);
                conn.end();
            }
            addDisabledCommand(conn, guild, channelId, commandName).catch(err => {
                console.log(err);
                conn.end();
            }).then(conn => {
                conn.end()
            });
        });
        this.sendLoadGuilds(guild.id);
    }

    enableCommand(guild, channelId, commandName) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0],
            user: "root",
            password: this.auth.password
        });

        let sendLoadGuilds = this.sendLoadGuilds;
        conn.connect(err => {
            if (err) {
                return console.log(err);
                conn.end();
            }
            removeDisabledCommand(conn, guild, channelId, commandName).catch(err => {
                console.log(err);
                conn.end();
            }).then(conn => {
                conn.end()
            });
        });
        this.sendLoadGuilds(guild.id);
    }
}
module.exports = myClient;