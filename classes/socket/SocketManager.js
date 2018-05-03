const express = require("express");
const io = require("socket.io-client");
const fs = require("fs");
const path = require("path");

module.exports = class SocketManager
{
    constructor(url)
    {
        this.url = url;
        this.app = express();
        this.http = require("http").createServer(this.app).listen(3003);

        //  Read and instantiate listeners.
        this.listeners = [];

        this.app.get('/reconnect', (req, res) => {
            if(req.query.pw == this.client.auth.password)
            {
                this.socket.connect();
                setTimeout(() => {
                    this.sendStatus();
                    this.sendCommands();
                });
                res.sendStatus(200);
            }
            else
                res.sendStatus(401);
        });

    }

    get socket()
    {
        return this.Socket;
    }

    set socket(value)
    {
        this.Socket = value;
        this.listeners.forEach(listener => listener.socket = value);
    }

    set client(value)
    {
        this.Client = value;
        if(!this.listeners.length)
            this.load();
    }

    get client()
    {
        return this.Client;
    }

    load()
    {
        fs.readdir(__dirname + '/Listeners/', (err, files) => {
            if(err) 
                return console.log(err);
            files.forEach(file => 
            {
                if (path.extname(file) != ".js")
                    return;
                const Listener = require('./Listeners/'+ file);
                const listener = new Listener(this.client);
                this.listeners.push(listener);
            });
        });
    }

    connect()
    {
        delete this.socket;
        return new Promise((resolve, reject) => {
            this.socket = io.connect(this.url);
            this.socket.on('auth', (auth) => resolve(auth)).on('disconnect', () => reject("Password missing from query string"));            
            setTimeout(() => reject("Connection timed out."), 5000);
        });
    }

    sendStatus(extended)
    {
        let status = {
            status: this.client.user.presence.status,
            guilds: this.client.guilds.size,
            connections: this.client.voiceConnections.size,
            connlist: !extended ? [] : this.client.voiceConnections.map(conn => { return {  id: conn.channel.guild.id,
                                                                                            guild : conn.channel.guild.name,
                                                                                            length : conn.channel.guild.playlist.queue.length,
                                                                                            members : conn.channel.members.size }})
        };
        this.socket.emit('status', status);
        return status;
    }

    sendCommands()
    {
        this.socket.emit('commands', this.client.commands.filter(cmd => !cmd.ownerOnly).map(command => {
            return {    name: command.name,
                        group: command.group,
                        aliases: command.triggers.join(', ') || 'N/A',
                        description : command.description,
                        example : command.example   }
        }));
    }
}