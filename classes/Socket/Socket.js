module.exports = class Socket
{
    constructor(client, name, fn)
    {
        this.client = client;
        this.fn = fn;
        this.name = name;
        this.socket = client.socketManager.socket;
    }

    get socket()
    {
        return this.Socket;
    }

    set socket(value)
    {
        this.Socket = value;
        this.Socket.on(this.name, this.fn);
    }
}