const mysql = require("mysql");
const async = require("async");

module.exports = class Database
{
    constructor(client)
    {
        this.auth = client.auth;
        this.client = client;
        this.certs = {
            user: "root",
            password: this.auth.password,
            host: this.auth.sqlServer    };
        
        this.conn = mysql.createConnection(this.certs);
        this.connected = false;        
    }

    //  METHOD TO OPEN THE CONNECTION
    open()
    {
        return new Promise((resolve, reject) => {
            if(this.connected)
                return resolve(this.conn);
            this.conn.connect(function(error) 
            {
                if(error)
                {
                    console.log("There was an error connecting to the database: \n" + error);
                    reject();
                }
                else
                {
                    this.connected = true;
                    resolve(this.conn);
                }
            });   
        });
    }

    //  METHOD TO CLOSE THE CONNECTION
    close()
    {
        this.conn.end();
        this.connected = false;
    }

    //  METHOD TO RUN A TRANSACTION, PASS THE SQL CONNECTION IN AS A PARAMETER.
    //  NOTE: this will not close the connection automatically.
    runTransaction(conn, queries)
    {
        return new Promise((resolve, reject) => 
        {
            let transactionError = "";
            async.some(queries, 
                (query, callback) =>
                    conn.query(query, (err, res) => err ? callback(err) : null),
                error => 
                    transactionError += error + '\n'
            );
            return transactionError != "" ? reject(transactionError) : resolve(conn);
        });
    }

    //  METHOD TO RUN A FULL TRANSACTION INCLUDING CONNECTING
    runFullTransaction(queries)
    {
        return new Promise((resolve, reject) => 
        {
            let transactionError = "";
            this.open().then(conn => {
                async.some(queries, 
                    (query, callback) =>{
                        console.log(query);
                        conn.query(query, (err, res) => err ? callback(err) : null)},
                    error =>
                        transactionError += error + '\n'
                );
                this.close();
                return transactionError != "" ? reject(transactionError) : resolve(this.conn);
            }).catch(err => 
                reject(err));
        });
    }
}