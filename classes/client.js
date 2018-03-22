const DBF = require("discordjs-bot-framework");
const Discord = require("discord.js");
const mysql = require("mysql");
const Playlist = require("./playlist.js");
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
            this.setPrefix(guild, guild.client.prefix);
            guild.playlist = new Playlist(guild);
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
            });
            this.sendStatus(false);            
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
                host: this.auth.webserver.split(":")[0] + ":3306",
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
            });
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
                        channel.send(message);
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
                else if(!channel.permissionsFor(channel.guild.me).has("SEND_MESSAGES"))
                    return;
                else
                    channel.send(message);
            }
            if(member.guild.channels.filter(ch => ch.type == "text" && ch.topic).find(ch => ch.topic.toLowerCase().includes(member.guild.prefix + "join")) && member != member.guild.me)
                announceLeave(member);
        });
    }

    loadGuilds(client) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0] + ":3306",
            user: "root",
            password: this.auth.password
        });
        conn.connect(function (err) {
            loadPrefixes(conn, client).then(conn => {
                console.log("Successfully loaded prefixes for " + client.guilds.size + " servers!");
                loadAutoRoles(conn, client).then(conn => {
                    console.log("Successfully loaded default roles for " + client.guilds.size + " servers!");
                    loadGreetings(conn, client).then(conn => {
                        console.log("Successfully loaded greetings and farewells for " + client.guilds.size + " servers!");
                        loadDisabledCommands(conn, client).then(conn => {
                            console.log("Successfully loaded disabled commands for " + client.guilds.size + " servers!");
                            conn.end();
                        }).catch(err => {
                            console.log("Error: " + err);
                            conn.end();
                        });
                    }).catch(err => console.log(err)); //catch loadGreetings
                }).catch(err => console.log(err)); //catch loadAutoRoles
            }).catch(err => console.log(err)); //catch loadPrefixes
        });
    }

    loadUsers(client){
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0] + ":3306",
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
            host: this.auth.webserver.split(":")[0] + ":3306",
            user: "root",
            password: this.auth.password
        });
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
            });
        });
    }

    initPlaylist(guild) {
        if (guild.playlist && guild.playlist.message && guild.playlist.message.collector)
            guild.playlist.message.collector.stop();
        if(guild.playlist && guild.playlist.timeout)
            clearTimeout(guild.playlist.timeout);
        this.sendStatus(true,false);            
        delete guild.playlist;
        guild.playlist = new Playlist(guild);
    }

    sendStatus(extended){
        
        let status = {
            status: this.user.presence.status,
            guilds: this.guilds.size,
            connections: this.voiceConnections.size,
            connlist: []
        };
        if(extended)
            this.voiceConnections.forEach(conn => 
                status.connlist.push({
                    guild: conn.channel.guild.name,
                    length: conn.channel.guild.playlist.queue.length,
                    members: conn.channel.members.size
                }));
        snekfetch.post("http://"+this.auth.webserver + "/servers/status")
                .send({status})
                .end()
                .catch(err => {
                    this.reRegister();
                    this.sendStatus();
                });
    }

    reRegister(){
        snekfetch.get("http://"+auth.webserver+"/servers/register?pw=" + auth.password).then(response => {
            if(response.status != 200)
                return console.log("Error re-registering server");
            snekfetch.get("http://"+auth.webserver + "/servers/auth").then(authResponse => {
                if(authResponse.status != 200)
                    return console.log("Error fetching auth.");
                    
                this.auth = JSON.parse(authResponse.text);
            }).catch(err => console.log("Error re-authorising)"));
        }).catch(err => console.log("Error re-registering server"));
    }

    setPrefix(guild, prefix) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0] + ":3306",
            user: "root",
            password: this.auth.password
        });


        conn.connect(function (err) {
            updateGuildPrefix(conn, guild, prefix).catch(err => {
                console.log(err);
                conn.end();
            }).then((conn) => conn.end());
        });
    }

    setAutoRole(role) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0] + ":3306",
            user: "root",
            password: this.auth.password
        });

        conn.connect(function (err) {
            updateAutoRole(conn, role).catch(err => {
                console.log(err);
                conn.end();
            }).then((conn) => conn.end());
        })
    }

    dropAutoRole(guild) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0] + ":3306",
            user: "root",
            password: this.auth.password
        });

        conn.connect(function (err) {
            removeAutoRole(conn, guild).catch(err => {
                console.log(err);
                conn.end();
            }).then((conn) => conn.end());
        })
    }

    setGreeting(msg, greeting) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0] + ":3306",
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
                })
            }).catch(err => {
                console.log(err);
                conn.end();
            });
        });
    }

    setFarewell(msg, farewell) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0] + ":3306",
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
    }

    dropGreeting(guild) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0] + ":3306",
            user: "root",
            password: this.auth.password
        });

        conn.connect(err => {
            if (guild.farewell)
                removeGreeting(conn, guild).catch(err => {
                    console.log(err);
                    conn.end();
                }).then((conn) => conn.end());
            else
                removeGuildFromGreetings(conn, guild).catch(err => {
                    console.log(err);
                    conn.end();
                }).then((conn) => conn.end());
        });
    }

    dropFarewell(guild) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0] + ":3306",
            user: "root",
            password: this.auth.password
        });

        conn.connect(err => {
            if (guild.greeting)
                removeFarewell(conn, guild).catch(err => {
                    console.log(err);
                    conn.end();
                }).then((conn) => conn.end());
            else
                removeGuildFromGreetings(conn, guild).catch(err => {
                    console.log(err);
                    conn.end();
                }).then((conn) => conn.end());
        });
    }

    disableCommand(guild, channelId, commandName) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0] + ":3306",
            user: "root",
            password: this.auth.password
        });

        conn.connect(err => {
            if (err) {
                return console.log(err);
                conn.end();
            }
            addDisabledCommand(conn, guild, channelId, commandName).catch(err => {
                console.log(err);
                conn.end();
            }).then(conn => conn.end());
        });
    }

    enableCommand(guild, channelId, commandName) {
        var conn = mysql.createConnection({
            host: this.auth.webserver.split(":")[0] + ":3306",
            user: "root",
            password: this.auth.password
        });

        conn.connect(err => {
            if (err) {
                return console.log(err);
                conn.end();
            }
            removeDisabledCommand(conn, guild, channelId, commandName).catch(err => {
                console.log(err);
                conn.end();
            }).then(conn => conn.end());
        });
    }
}
module.exports = myClient;