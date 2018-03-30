const mysql = require("mysql");
var Promise = require("bluebird");
module.exports = function () {

    this.removeGuild = function (conn, guild) {
        return new Promise((resolve, reject) => {
            conn.query("use Guilds", (err, res) => {
                if (err) return reject(err);
                conn.query("DELETE FROM Prefixes WHERE id = " + guild.id + ";", (err, res) => {
                    if (err) return reject(err);
                    conn.query("DELETE FROM Default_Roles WHERE GuildId = " + guild.id + ";", (err, res) => {
                        if (err) return reject(err);
                        conn.query("DELETE FROM Greetings WHERE guildId = " + guild.id, (err, res) => {
                            if (err) return reject(err);
                            conn.query("DELETE FROM DisabledCommands WHERE guildId = " + guild.id, (err, res) => {
                                if (err) return reject(err);
                                conn.query("DELETE FROM Guilds WHERE id = " + guild.id + ";", (err, res) => {
                                    if (err) return reject(err);
                                    resolve(conn);
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    this.addGuild = function (conn, guild) {
        return new Promise((resolve, reject) => {
            conn.query("use Guilds", (err, res) => {
                if (err) return reject(err);
                conn.query("SELECT * FROM Guilds WHERE id = " + guild.id + ";", (err, res) => {
                    if (err)
                        return reject(err);
                    if (res.length == 0)
                        conn.query("INSERT INTO Guilds (id, name) VALUES ('" + guild.id + "','" + guild.name.replace(/[^ -~]|['"]/g, "*") + "');", (err, res) => {
                            if (err) return reject(err);
                            resolve(conn);
                        });
                    else
                        resolve(conn);
                });
            });
        })
    }

    this.addGuildToPrefixes = function (conn, guild) {
        return new Promise((resolve, reject) => {
            this.addGuild(conn, guild).then(conn => {
                conn.query("SELECT * FROM Prefixes WHERE id = " + guild.id + ";", (err, res) => {
                    if (res.length == 0)
                        conn.query("INSERT INTO Prefixes (id, prefix) VALUES ('" + guild.id + "', '" + guild.client.prefix + "');", (err, res) => {
                            if (err) return reject(err);
                            guild.prefix = guild.client.prefix;
                            resolve(conn);
                        });
                    else
                        resolve(conn);
                });
            }).catch(err => {
                return reject(err);
            });
        });
    }

    this.updateGuildPrefix = function (conn, guild, prefix) {
        return new Promise((resolve, reject) => {
            conn.query("use Guilds", (err, res) => {
                if (err) return reject(err);
                if (guild.prefix != prefix)
                    this.addGuildToPrefixes(conn, guild).then(conn => {
                        conn.query("UPDATE Prefixes SET prefix = '" + prefix + "' WHERE id = '" + guild.id + "';", (err, res) => {
                            if (err) return reject(err);
                            guild.prefix = prefix;
                            resolve(conn);
                        });
                    }).catch(err => {
                        return reject(err);
                    });
                else
                    resolve(conn);
            });
        });
    }

    this.loadPrefixes = function (conn, client) {
        let updateGuildPrefix = this.updateGuildPrefix;

        return new Promise(function (resolve, reject) {
            conn.query("use Guilds", (err, res) => {
                if (err) return reject(err);
                client.guilds.forEach(guild => {
                    conn.query("SELECT * FROM Guilds WHERE id = " + guild.id + " LIMIT 1;", (err, res) => {
                        if (err) return reject(err);
                        let waitfor;
                        if (res.length == 0) {
                            waitfor = updateGuildPrefix(conn, guild, guild.client.prefix).catch(err => reject(err));
                        } else {
                            if (guild.name != res[0].name)
                                conn.query("UPDATE Guilds SET name = \"" + guild.name.replace(/[^ -~]/g, "*") + "\" WHERE id = " + guild.id, function (err, res) {
                                    if (err)
                                        console.log(err);
                                });
                            conn.query("SELECT * FROM Prefixes WHERE id = " + guild.id + " LIMIT 1", (err, res) => {
                                if (err)
                                    return reject(err);
                                if (res.length == 0)
                                    waitfor = updateGuildPrefix(conn, guild, guild.client.prefix).catch(err => reject(err));
                                else {
                                    guild.prefix = res[0].prefix;
                                }
                            });
                        }
                        if (guild.id == client.guilds.array()[client.guilds.size - 1].id) {
                            if (waitfor)
                                waitfor.then(conn => resolve(conn)).catch(err => reject(err));
                            else
                                resolve(conn);
                        }
                    });
                });
            });
        });
    }

    this.loadAutoRoles = function (conn, client) {
        return new Promise((resolve, reject) => {
            conn.query("use Guilds", (err, res) => {
                if (err) return reject(err);
                client.guilds.forEach(guild => {
                    conn.query("SELECT * FROM Default_Roles WHERE GuildId = " + guild.id + " LIMIT 1;", (err, res) => {
                        if (err) return reject(err);
                        if (res.length > 0)
                            guild.autoRole = res[0].RoleId;
                        if (guild.id == client.guilds.array()[client.guilds.size - 1].id) {
                            //conn.end();
                            resolve(conn);
                        }
                    });
                });
            });
        });
    }

    this.addGuildToAutoRoles = function (conn, role) {
        return new Promise((resolve, reject) => {
            this.addGuild(conn, role.guild).then(conn => {
                conn.query("SELECT * FROM Default_Roles WHERE GuildId = " + role.guild.id + ";", (err, res) => {
                    if (err) return reject(err);
                    if (res.length == 0) {
                        conn.query("INSERT INTO Default_Roles (GuildId, RoleId) VALUES ('" + role.guild.id + "', '" + role.id + "');", (err, res) => {
                            if (err) return reject(err);
                            role.guild.autoRole = role.id;
                            resolve(conn);
                        })
                    } else
                        resolve(conn);
                })
            }).catch(err => {
                return reject(err);
            });
        })
    }

    this.updateAutoRole = function (conn, role) {
        return new Promise((resolve, reject) => {
            this.addGuildToAutoRoles(conn, role).then(conn => {
                conn.query("UPDATE Default_Roles SET RoleId = '" + role.id + "' WHERE GuildId = " + role.guild.id + ";", (err, res) => {
                    if (err) return reject(err);
                    role.guild.autoRole = role.id;
                    resolve(conn);
                })
            }).catch(err => {
                return reject(err);
            })
        });
    }

    this.removeAutoRole = function (conn, guild) {
        return new Promise((resolve, reject) => {
            conn.query("use Guilds", (err, res) => {
                if (err) return reject(err);
                conn.query("DELETE FROM Default_Roles WHERE GuildId = " + guild.id + ";", (err, res) => {
                    if (err) return reject(err);
                    guild.autoRole = null;
                    resolve(conn);
                });
            });
        })
    }

    this.addGuildToGreetings = function (conn, guild) {
        return new Promise((resolve, reject) => {
            conn.query("use Guilds", (err, res) => {
                if (err) return reject(err);
                conn.query("SELECT * from Greetings WHERE guildId = " + guild.id, (err, res) => {
                    if (err) return reject(err);
                    if (res.length == 0)
                        conn.query("INSERT into Greetings (guildId, channelId, Greeting, Farewell) VALUES ('" + guild.id + "', null, null, null);", (err, res) => {
                            if (err) return reject(err);
                            resolve(conn);
                        });
                    else
                        resolve(conn);
                });
            });
        });
    }

    this.setGreeting = function (conn, guild, greeting) {
        return new Promise((resolve, reject) => {
            this.addGuildToGreetings(conn, guild).then(conn => {
                conn.query("UPDATE Greetings SET Greeting = '" + greeting + "' WHERE guildId = " + guild.id, (err, res) => {
                    if (err) return reject(err);
                    guild.greeting = greeting;
                    resolve(conn);
                });
            }).catch(err => reject(err));
        });
    }

    this.setFarewell = function (conn, guild, farewell) {
        return new Promise((resolve, reject) => {
            this.addGuildToGreetings(conn, guild).then(conn => {
                conn.query("UPDATE Greetings SET Farewell = '" + farewell + "' WHERE guildId = " + guild.id, (err, res) => {
                    if (err) return reject(err);
                    guild.farewell = farewell;
                    resolve(conn);
                });
            }).catch(err => reject(err));
        });
    }

    this.removeGreeting = function (conn, guild) {
        return new Promise((resolve, reject) => {
            this.addGuildToGreetings(conn, guild).then(conn => {
                conn.query("UPDATE Greetings SET Greeting = null WHERE guildId = " + guild.id, (err, res) => {
                    if (err) return reject(err);
                    guild.greeting = null;
                    resolve(conn);
                });
            }).catch(err => reject(err));
        });
    }

    this.removeFarewell = function (conn, guild) {
        return new Promise((resolve, reject) => {
            this.addGuildToGreetings(conn, guild).then(conn => {
                conn.query("UPDATE Greetings SET Farewell = null WHERE guildId = " + guild.id, (err, res) => {
                    if (err) return reject(err);
                    guild.farewell = null;
                    resolve(conn);
                });
            }).catch(err => reject(err));
        });
    }

    this.removeGuildFromGreetings = function (conn, guild) {
        return new Promise((resolve, reject) => {
            conn.query("use Guilds", (err, res) => {
                if (err) return reject(err);
                if(!guild)
                    return resolve(conn);
                conn.query("DELETE FROM Greetings WHERE guildId = " + guild.id, (err, res) => {
                    if (err) return reject(err);
                    guild.farewell = null;
                    guild.greeting = null;
                    guild.greetChannel = null;
                    resolve(conn);
                });
            });
        });
    }

    this.setGreetingChannel = function (conn, guild, channelId) {
        return new Promise((resolve, reject) => {
            this.addGuildToGreetings(conn, guild).then(conn => {
                conn.query("UPDATE Greetings SET channelId = '" + channelId + "' WHERE guildId = " + guild.id, (err, res) => {
                    if (err) return reject(err);
                    guild.greetChannel = channelId;
                    resolve(conn);
                });
            }).catch(err => reject(err));
        });
    }

    this.loadGreetings = function (conn, client) {
        return new Promise((resolve, reject) => {
            conn.query("use Guilds", (err, res) => {
                if (err) return reject(err);
                conn.query("SELECT * FROM Greetings WHERE guildId", (err, res) => {
                    if (err)
                        return reject(err);
                    if (res.length == 0)
                        return resolve(conn);
                    res.forEach(tuple => {
                        var guild = client.guilds.find(g => g.id == tuple.guildId);
                        if (!guild)
                            this.removeGuildFromGreetings(conn, guild).catch(err => reject(err));
                        else {
                            guild.greeting = tuple.Greeting;
                            guild.farewell = tuple.Farewell;
                            guild.greetChannel = tuple.channelId;
                        }
                        if (tuple.guildId == res[res.length - 1].guildId)
                            resolve(conn);
                    });
                });
            });
        });
    }

    this.addDisabledCommand = function (conn, guild, channelId, commandName) {
        return new Promise((resolve, reject) => {
            this.addGuild(conn, guild).then(conn => {
                conn.query("SELECT * FROM DisabledCommands WHERE guildId = '" + guild.id + "' AND channelId = '" + channelId + "' AND command = '" + commandName + "'", (err, res) => {
                    if (err) return reject(err);
                    if (res.length != 0)
                        resolve(conn);
                    conn.query("INSERT INTO DisabledCommands (guildId, channelId, command) VALUES ('" + guild.id + "', '" + channelId + "', '" + commandName + "');", (err, res) => {
                        if (err)
                            return reject(err);
                        if (channelId == "all")
                            guild.disabledCommands.push(commandName);
                        else
                            guild.channels.get(channelId).disabledCommands.push(commandName);
                        resolve(conn);
                    });
                });
            }).catch(err => reject(err));
        });
    }

    this.removeDisabledCommand = function (conn, guild, channelId, commandName) {
        return new Promise((resolve, reject) => {
            conn.query("use Guilds", (err, res) => {
                if (err)
                    return reject(err);
                conn.query("DELETE FROM DisabledCommands WHERE guildId = '" + guild.id + "' AND channelId = '" + channelId + "' AND command = '" + commandName + "'", (err, res) => {
                    if (err)
                        return reject(err);
                    if (channelId == "all")
                        guild.disabledCommands = guild.disabledCommands.filter(cmd => cmd != commandName);
                    else
                        guild.channels.get(channelId).disabledCommands = guild.channels.get(channelId).disabledCommands.filter(cmd => cmd != commandName);
                    resolve(conn);
                });
            });
        });
    }

    this.loadDisabledCommands = function (conn,client) {

        return new Promise((resolve, reject) => {

            conn.query("Use Guilds", (err, res) => {
                if (err)
                    return reject(err);
                client.guilds.forEach(guild => {
                    conn.query("SELECT * FROM DisabledCommands WHERE guildId = " + guild.id, (err, res) => {
                        if (err)
                            return reject(err);
                        guild.disabledCommands = new Array();
                        guild.channels.filter(ch => ch.type == "text").forEach(ch => ch.disabledCommands = new Array());
                        res.forEach(result => {
                            if (result.channelId == "all")
                                guild.disabledCommands.push(result.command);
                            else if (guild.channels.get(result.channelId))
                                guild.channels.get(result.channelId).disabledCommands.push(result.command);
                            else
                                this.removeDisabledCommand(conn, guild, result.channelId, result.command).catch(err => reject(err));
                        });
                    });
                    if (guild.id == client.guilds.array()[client.guilds.size - 1].id) {
                        setTimeout(() => {
                            //conn.end();                                
                            resolve(conn);
                        }, 1);
                    }
                });
            });
        });
    }

    this.addUserToUsers = function(conn, user){
        return new Promise((resolve, reject) => {
            conn.query("Use Users", (err, res) => {
                if(err)
                    reject(err);
                conn.query("SELECT * FROM Users WHERE id = " + user.id + ";", (err, res) => {
                    if(err)
                        reject(err);
                    if(res.length == 0)
                        conn.query("INSERT INTO Users (id, name) VALUES ('" +user.id+"', '" + user.username.replace(/[^ -~]|['"]/g, "*") + "');", (err, res) => {
                            if(err)
                                return reject(err);
                            resolve(conn);
                        });
                    else if(res[0].name != user.username.replace(/[^ -~]|['"]/g, "*"))
                        conn.query("UPDATE Users SET name = '" + user.username.replace(/[^ -~]|['"]/g, "*") + "' WHERE id = '" + user.id + "';", (err, res) => {
                            if(err) return reject(err);
                            resolve(conn);
                        });
                    else
                        resolve(conn);
                });
            });
        });
    }

    this.addUserToEconomy = function(conn, user){
        return new Promise((resolve, reject) => {
            this.addUserToUsers(conn, user).then(conn => {
                conn.query("SELECT * FROM Economy WHERE id = '" + user.id + "';", (err, res) => {
                    if(!res || res.length == 0)
                        conn.query("INSERT INTO Economy (id, loves, smacks, lovereset, smacksreset, rep, reprefresh) VALUES ('" + user.id +"','" + user.loves+"','" + user.smacks + "','" + user.refreshLoves + "','" + user.refreshSmacks + "','" + user.rep + "', '" + user.repRefresh + "');", (err, res) => {
                            if(err)
                                return reject(err);
                            resolve(conn);
                        });
                    else
                        resolve(conn);
                });
            }).catch(err => reject(err));
        });
    }

    this.addUserToDonators = function(conn, user){
        return new Promise((resolve, reject) => {
            this.addUserToUsers(conn, user).then(conn => {
                conn.query("SELECT * from Donators WHERE id = '" + user.id + "';", (err, res) => {
                    if(!res || res.length == 0)
                    {
                        conn.query("INSERT INTO Donators (id, tier, expires) VALUES ('" + user.id + "','" + user.donationTier + "','" + user.donationExpires + "');", (err, res) => {
                            if(err)
                                reject(err);
                            else
                                resolve(conn);
                        });
                    }else
                        resolve(conn);
                })
            });
        }) 
    }

    this.loadUsersDB = function(conn, client){
        return new Promise((resolve, reject) => {
            conn.query("Use Users", (err, res) => {
                if(err)
                    reject(err);
                conn.query("SELECT * FROM Users NATURAL JOIN Economy FULL JOIN Donators ON Users.id = Donators.id;", (err, res) => {
                    if(err)
                        return reject(err);
                    res.forEach(tuple => {
                        var user = client.users.get(tuple.id);
                        if(!user)
                            return resolve(conn);
                        console.log(user.username);                            
                        user.smacks = tuple.smacks;
                        user.loves = tuple.loves;
                        user.rep = tuple.rep;
                        user.refreshLoves = tuple.lovereset;
                        user.refreshSmacks = tuple.smacksreset;
                        user.repRefresh = tuple.reprefresh;
                        if(res[0].tier)
                            user.donationTier = res[0].tier;
                        if(res[0].expires)
                            user.donationExpires = res[0].expires;
                    });
                    resolve(conn);
                });
            });
        });
    }

    this.loadUser = function(conn, user){
        return new Promise((resolve, reject) => {
            conn.query("Use Users", (err, res) => {
                if(err)
                    return reject(err);
                conn.query("SELECT * FROM Users NATURAL JOIN Economy NATURAL JOIN Donators WHERE id = '" + user.id + "';", (err, res) => {
                    if(err || !res || !res.length || res.length == 0 || !res[0])
                        return resolve(conn);
                    user.smacks = res[0].smacks;
                    user.loves = res[0].loves;
                    user.rep = res[0].rep;
                    user.refreshLoves = res[0].lovereset;
                    user.refreshSmacks = res[0].smacksreset;
                    user.repRefresh = res[0].reprefresh;
                    if(res[0].tier)
                        user.donationTier = res[0].tier;
                    if(res[0].expires)
                        user.donationExpires = res[0].expires;
                    resolve(conn);
                });
            }); 
        });
    }

    this.updateUser = function(conn, user){
        return new Promise((resolve, reject) => {
            this.addUserToEconomy(conn,user).then(conn => {
                conn.query("UPDATE Economy SET loves = '" + user.loves + "',smacks = '" + user.smacks + "', lovereset = '" + user.refreshLoves + "', smacksreset = '" + user.refreshSmacks + "', rep = '" + user.rep + "', reprefresh = '" + user.repRefresh + "' WHERE id = '" + user.id + "'", (err, res) => {
                    if(err)
                        return reject(err);
                    if(user.donationTier)
                    {
                        this.addUserToDonators(conn, user).then(conn => {
                            conn.query("UPDATE Donators SET tier = " + user.donationTier + ", expires ='" + user.donationExpires + "' WHERE id = '" + user.id + "';", (err, res) => {
                                if(err)
                                    return reject(err);
                                resolve(conn);
                            });
                        }).catch(err => reject(err));
                    }
                    else
                        resolve(conn);
                });
            }).catch(err => reject(err));
        });
    }
}