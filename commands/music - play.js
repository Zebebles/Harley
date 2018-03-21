const DBF = require('discordjs-bot-framework');
const Discord = require('discord.js');
const snekfetch = require("snekfetch");
const request = require("request");
const auth = require("../resources/auth.json");
const SC = require("node-soundcloud");
const spotify = require("spotify-web-api-node");
const yta = require("simple-youtube-api");
const ytas = new yta(auth.googleKey);
var Promise = require("bluebird");
const ypi = require("youtube-playlist-info");


module.exports = class Hello extends DBF.Command{
    constructor(){
        super({
             name: "play",
             triggers: ["play"],
             group: "Music",
             ownerOnly : false,
             description: "Plays a YouTube, Spotify, or Soundcloud song/playlist in the voice channel. -next will add the song to the top of the queue. -choose will let you choose 1 of the first 5 search results.",
             example: ">>play song or url (-choose) (-next)\n>>play never gonna give you up (-next)(-choose)\n>>play https://www.youtube.com/watch?v=dQw4w9WgXcQ (-next)\n>>play https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=MT7GU3ooTxGKAIQTt7UPeA (-next)\n>>play https://soundcloud.com/andreasedstr-m/rick-astley-never-gonna-give (-next)",             
             guildOnly : true,
             reqArgs: true,
             reqBotPerms : ["CONNECT", "SPEAK", "EMBED_LINKS"]
        });
    }

    run(params = {msg, args}){
        let msg = params.msg; let args = params.args;
        let channel = msg.member.voiceChannel;
        if((!args || args == "") && !msg.guild.playlist.paused) 
            return msg.channel.send("**Usage:**\t`" + msg.client.prefix + "play <url, song name, or lyrics> -first (optional) -choose (optional)`");
        else if((!args || args == "") && msg.guild.playlist.paused) 
            return msg.client.commands.find(cmd => cmd.areYou("pause")).run(params);
        if(!msg.member.voiceChannel) 
            return msg.channel.send("You are not in a voice channel.");
        let djrole = msg.guild.roles.find(r => r.name.match(/dj[^a-zA-Z]|[^a-zA-Z]dj/gi) || r.name.toLowerCase() == "dj");
        if(djrole && msg.member.voiceChannel && msg.member.voiceChannel.members.find(m => m.roles.find(r => r.id == djrole.id)) && !msg.member.roles.find(r => r.id == djrole.id))
            return msg.channel.send("The role `" + djrole.name + "` has been recognised as a DJ role, and at least one person in the channel has it. You must have this role to interact with the music.").then(m => m.delete(3000));
        if(!msg.member.voiceChannel.joinable || !msg.member.voiceChannel.speakable) 
            return msg.channel.send("I can't join that voice channel.");
        if(msg.guild.playlist.qing)
            return msg.channel.send("Please wait until the current song or playlist has finished being added before queueing something else.");

        let playNext = false;
        if(args.match(/-(\s*)?(next|first)/gi)){
            playNext = true;
            args = args.replace(/-(\s*)?(next|first)/gi, "");            
        }

        let choose = false;
        if(args.match(/-(\s*)?(choose|pick)/gi)){
            choose = true;
            args = args.replace(/-(\s*)?(choose|pick)/gi, "");            
        }

        let position = msg.channel.guild.playlist.queue.length;
        if(playNext)
            position = 1;
        
        if(args.toLowerCase().includes("soundcloud.com/"))
            return soundcloud();
        else if(args.match(/https:\/\/open.spotify.com/g) || args.match(/spotify:(track|user|playlist|album)/g))
            return spotify();
        else    
            return youtube();

        function youtube(){
            let videoID = null;
            let playlistID = null;
            if(args.match(/[&?]list=/g))
                playlistID = args.match(/[&?]list=.[^&? ]*/g)[0].replace(/[&?]list=/g, "");
            if(args.match(/[&?]v=/g))
                videoID = args.match(/[&?]v=.[^&? ]*/g)[0].replace(/[&?]v=/g, "");
            
            if(playlistID){ //if they linked a playlist
                addYTPlaylistById(playlistID, videoID);
            }
            else if(videoID){ //if they linked a video
                addYTSongById(videoID);
            }
            else{ //if they're searching
                snekfetch.get('https://www.googleapis.com/youtube/v3/search?part=snippet&key=' + auth.googleKey + '&maxResults=10&q=' + args).then(body =>{
                    //console.log("Request - Youtube Search - " + msg.guild.name);
                    let results = JSON.parse(body.text);
                    results = results.items.filter(res => res.id.kind != "youtube#channel");
                    if(results.length == 0)
                        return msg.channel.send("No song or playlist found.");
                    if(!choose)
                        if(results[0].id.kind == "youtube#playlist")
                            return addYTPlaylistById(results[0].id.playlistId);
                        else
                            return addYTSongById(results[0].id.videoId);
                    
                    let message = "";
                    for(var i = 0; i < 5 && i < results.length; i++)
                        if(results[i].id.kind == "youtube#playlist")
                            message += "\n`Option " + (i+1) + "` - **" + results[i].snippet.title + "** `[playlist]` by " + results[i].snippet.channelTitle;
                        else
                            message += "\n`Option " + (i+1) + "` - **" + results[i].snippet.title + "** by " + results[i].snippet.channelTitle;
                    
                    message += "\nType **just** a number in chat to choose or `cancel`.\ne.g. `1` will play the first option.";
                    
                    let botMessage;
                    msg.channel.send(message).then(m => botMessage = m);
                    
                    const filter = m => m.author.id == msg.author.id;
                    msg.channel.awaitMessages(filter, {maxMatches: 1, time: 15000}).then( collected => {
                        if(!collected || collected.size == 0)
                            return botMessage.edit("Selection timed out.  Nothing will be played.");
                        if(collected.first().content.toLowerCase() == "cancel")
                            return botMessage.edit("Selection cancelled.  Nothing will be played.");
                        if(!collected.first().content.match(/\d{1}/g) || collected.first().content.match(/\d{1}/g).length > 1)
                            return botMessage.edit("That is not a valid choice.");
                        let choice = collected.first().content.match(/\d{1}/g)[0]-1;
                        botMessage.delete();
                        
                        if(results[choice].id.kind == "youtube#playlist")
                            addYTPlaylistById(results[choice].id.playlistId, videoID);
                        else
                            addYTSongById(results[choice].id.videoId);
                    }).catch(err => botMessage.edit("Selection timed out.  Nothing will be played."));
    
                }).catch(err => {
                    console.log("Error searching for " + args + " in " + msg.guild.name + ".\n\n" + err);
                    return msg.channel.send("There was an error searching for that.  Please try again.");
                });
            }
        }

        function addYTSongById(id){
            new Promise(function (resolve, reject){
                msg.guild.playlist.qing = true; //stop others from being able to queue at the same time.
                let partial = false;
                let qm = msg.channel.send("",{embed: {title: "🔎 Searching for song ...", color: msg.guild.me.displayColor}}).then(qm => { //notify user that harley's searching for the song
                    msg.guild.playlist.qmessage = qm 
                    ytas.getVideoByID(id).then(vid => { //search for the song
                        if(!vid || !vid.title || vid.title == "Deleted video" || vid.title == "Private video")
                            return reject({err:"Private / Deleted or region locked",reason:"I can't play Private, Deleted or Region locked videos."});
                        qm.edit("",{embed: {title: "⌛ Queueing song ...", color: msg.guild.me.displayColor}}).then(qm => {
                            msg.guild.playlist.qmessage = qm; //notify user that harley's found the song, and is now adding it.
                            msg.guild.playlist.textChannel = msg.channel; //set the text channel
                            var song;
                            song = {link: vid.id,type: "youtube", title: vid.title, duration: vid.durationSeconds, startTime: 0, seeks: 0, image: `https://img.youtube.com/vi/${vid.id}/mqdefault.jpg`};//create the song object 
                            resolve(song); //resolve will add the song to queue.
                        }).catch(err => reject(err)); //end of second qm
                    }).catch(err => reject({err, reason:"Error getting video from YouTube."}));//end ytas catch, send the error to our promise
                });//end of first qm
            }).then(song => {
                msg.guild.playlist.addSong(song, playNext); //add the song to the playlist
                msg.guild.playlist.sendQueueMessage(msg, song); //send the "song is queued message"
                if(!msg.guild.voiceConnection) //join the channel and play first song if it's the first one in the queue
                    channel.join().then(conn => msg.guild.playlist.playNext());
            }).catch(err => { //handle any errors
                if(msg.guild.playlist.qmessage)
                    msg.guild.playlist.qmessage.edit("", {embed: {title: "⚠ Error queuing YouTube track.", color: 16106519, description: "**Reason:** " + err.reason}}).then(m => msg.guild.playlist.qmessage = null); //delete the "searching for" messaging
                else
                    msg.channel.send("", {embed: {title: "⚠ Error queuing YouTube track.", color: 16106519, description: "**Reason:** " + err.reason}}).then(m => msg.guild.playlist.qmessage = null); //delete the "searching for" messaging

                console.log("Error queing YouTube song in " + msg.guild.name + "\n" + err.err + "\n" + err);
            }).finally(() => msg.guild.playlist.qing = false) //let people play music again.
        }

        function addYTPlaylistById(id, videoID){
            new Promise(function(resolve, reject){
                msg.guild.playlist.qing = true; //stop others from queing music at the same time
                let originalN = msg.guild.playlist.queue.length;
                let qm = msg.channel.send("",{embed: {title: "🔎 Searching for playlist ...", color: msg.guild.me.displayColor}}).then(qm => {//notify the user that the playlist is being searched for.
                    msg.guild.playlist.qmessage = qm //set the queuemessage
                    ypi(auth.googleKey, id).then(function(items) { //search for the playlist (tracks)
                        if(!items || !items.length > 0)
                            return reject({err:"Items array empty.", reason:"I can't play that playlist"});    
                        snekfetch.get('https://www.googleapis.com/youtube/v3/playlists?part=snippet&key=' + auth.googleKey + '&id=' + id ).then(body =>{ //get the title and what not from the playlist
                            let playlistInfo = JSON.parse(body.text).items[0];//get the playlist info
                            let playlistItems = items.filter(vid => vid.title != "Deleted video" && vid.title != "Private video");//filter out bad results
                            if(playlistItems.length == 0)
                                return reject({err:"Items array empty", reason:"I can't play that playlist."});

                            msg.guild.playlist.qmessage.edit("",{embed: {title: "⌛ Queueing songs from playlist ...", color: msg.guild.me.displayColor}}).then(qm => { //notify the user that the playlist has been found and the songs arebeing added.
                                msg.guild.playlist.qmessage = qm;
                                msg.guild.playlist.textChannel = msg.channel;                    
                                for(let i = 0; i < playlistItems.length; i++){
                                    if(videoID && playlistItems[i].id == videoID) //if this video's id was in the url sent by the user.
                                        msg.guild.playlist.queue.splice(msg.guild.playlist.queue.length-(playlistItems.indexOf(playlistItems[i])+1),0,{link: playlistItems[i].resourceId.videoId,type: "youtube", title: playlistItems[i].title, startTime: 0, seeks: 0, image: `https://img.youtube.com/vi/${playlistItems[i].resourceId.videoId}/mqdefault.jpg`});
                                    else
                                        msg.guild.playlist.addSong({link: playlistItems[i].resourceId.videoId,type: "youtube", title: playlistItems[i].title, startTime: 0, seeks: 0, image: `https://img.youtube.com/vi/${playlistItems[i].resourceId.videoId}/mqdefault.jpg`}, false);
                                }
                                if(msg.guild.playlist.queue.length == originalN)
                                    return reject({err:"No songs were queued.", reason:"Unable to queue any tracks."});
                                resolve({title: playlistInfo.snippet.title, tracks: msg.guild.playlist.queue.length-originalN});
                            });
                        });
                    }).catch(err => reject(err, "Error getting playlist from YouTube."));
                });
            }).then( (playlistInfo) => {
                msg.guild.playlist.sendQueueMessage(msg, playlistInfo);
                if(!msg.guild.voiceConnection)
                    channel.join().then(conn => msg.guild.playlist.playNext());
            }).catch( err => {
                if(msg.guild.playlist.qmessage)
                    msg.guild.playlist.qmessage.edit("", {embed:{title: "⚠ Error queuing YouTube playlist.", color: 16106519, description: "**Reason:** " + err.reason}}).then(m => msg.guild.playlist.qmessage = null); //edit the qmessage with the error
                else
                    msg.channel.send("", {embed: {title: "⚠ Error queuing YouTube playlist.", color: 16106519, description: "**Reason:** " + err.reason}}).then(m => msg.guild.playlist.qmessage = null); //send the error message
                
                console.log("Error queing YouTube playlist in " + msg.guild.name + "\n" + err.err + "\n" + err);
            }).finally(() => msg.guild.playlist.qing = false); //let people queue music again.
        }



        function soundcloud(){
            args = args.replace(/\?.*/g, "");

            let playlist = false;
            if(args.match(/sets\//g))
                playlist = true;
            
            msg.guild.playlist.qing = true;
            if(!playlist){
                let qm = msg.channel.send("",{embed: {title: "🔎 Searching for song ...", color: msg.guild.me.displayColor}}).then(qm => {
                    msg.guild.playlist.qmessage = qm;
                    request("https://api.soundcloud.com/resolve?url=" + args + "&client_id=" + auth.scID, (err, response, track) => {
                        addSCTrack(track);
                    });
                });
            }else{
                let qm = msg.channel.send("",{embed: {title: "🔎 Searching for playlist ...", color: msg.guild.me.displayColor}}).then(qm => {
                    msg.guild.playlist.qmessage = qm;
                    request("https://api.soundcloud.com/resolve?url=" + args + "&client_id=" + auth.scID, (err, response, playlist) => {
                        addSCPlaylist(playlist);
                    });
                });
            }
        }

        function addSCTrack(track){
            msg.guild.playlist.qing = true;
            new Promise(function(resolve,reject) {
                if(!track)
                    return reject({err: "No track", reason: "Could not play that track.  Please check the the URL is valid, and that the track is not premium-only."});
                if(typeof track == "string")
                    track = JSON.parse(track); 
                if(!track.title)
                    return reject({err: "Track has no title", reason: "Error 404: track not found :'c"});
                
                msg.guild.playlist.qmessage.edit("",{embed: {title: "⌛ Queueing song...", color: msg.guild.me.displayColor}}).then(qm => {
                    msg.guild.playlist.qmessage = qm;
                    var song;
                    if(track.artwork_url)
                        song = {url: track.permalink_url,link: track.stream_url , type: "soundcloud", title: track.title, duration: track.duration/1000, startTime: 0, seeks: 0, image : track.artwork_url.replace("large", "t500x500")};
                    else
                        song = {url: track.permalink_url,link: track.stream_url , type: "soundcloud", title: track.title, duration: track.duration/1000, startTime: 0, seeks: 0, image : "http://www.stickpng.com/assets/images/580b57fcd9996e24bc43c537.png"};
                    msg.guild.playlist.textChannel = msg.channel; //set the text channel
                    resolve(song);
                });
            }).then(song => {
                msg.guild.playlist.addSong(song, playNext); //add the song to the playlist
                msg.guild.playlist.sendQueueMessage(msg, song); //send the "song is queued message"
                if(!msg.guild.voiceConnection)
                    channel.join().then(conn => msg.guild.playlist.playNext());
            }).catch(err => { //handle any errors
                if(msg.guild.playlist.qmessage)
                    msg.guild.playlist.qmessage.edit("", {embed: {title: "⚠ Error queuing Soundcloud track.", color: 16106519, description: "**Reason:** " + err.reason}}).then(m => msg.guild.playlist.qmessage = null); //delete the "searching for" messaging
                else
                    msg.channel.send("", {embed: {title: "⚠ Error queuing Soundcloud track.", color: 16106519, description: "**Reason:** " + err.reason}}).then(m => msg.guild.playlist.qmessage = null); //delete the "searching for" messaging

                if(err.err)
                    console.log("Error queing Soundcloud song in " + msg.guild.name + "\n" + err.err);
                else
                    console.log("Error queing Soundcloud song in " + msg.guild.name + "\n" + err);
            }).finally(() => msg.guild.playlist.qing = false) //let people play music again.
        }

        function addSCPlaylist(playlist){
            let originalN = msg.guild.playlist.queue.length;
            msg.guild.playlist.qing = true;
            new Promise(function(resolve,reject){
                if(!playlist)
                    return reject({err: "", reason: "Could not resolve that URL.  Please check that it's valid."})
                if(typeof playlist == "string")
                    playlist = JSON.parse(playlist);
                if(!playlist.tracks)
                    return reject({err: "", reason: "Could not resolve that URL.  Please check that it's valid."});
                
                msg.guild.playlist.qmessage.edit("",{embed: {title: "⌛ Queueing song...", color: msg.guild.me.displayColor}}).then(qm => {
                    msg.guild.playlist.qmessage = qm;

                    playlist.tracks.forEach(track => {
                        if(track.artwork_url)
                            msg.guild.playlist.addSong({url: track.permalink_url,link: track.stream_url , type: "soundcloud", title: track.title, duration: track.duration/1000, startTime: 0, seeks: 0, image : track.artwork_url.replace("large", "t500x500")}, false);//if theres only one song left.                        
                        else
                            msg.guild.playlist.addSong({url: track.permalink_url,link: track.stream_url , type: "soundcloud", title: track.title, duration: track.duration/1000, startTime: 0, seeks: 0, image : "http://www.stickpng.com/assets/images/580b57fcd9996e24bc43c537.png"}, false);//if theres only one song left.                        
                    });
                    msg.guild.playlist.textChannel = msg.channel; //set the text channel
                    resolve({tracks: msg.guild.playlist.queue.length-originalN, title: playlist.title})
                });
            }).then( (playlistInfo) => {
                msg.guild.playlist.sendQueueMessage(msg, playlistInfo);
                if(!msg.guild.voiceConnection)
                    channel.join().then(conn => msg.guild.playlist.playNext());
            }).catch( err => {
                if(msg.guild.playlist.qmessage)
                    msg.guild.playlist.qmessage.edit("", {embed:{title: "⚠ Error queuing Soundcloud playlist.", color: 16106519, description: "**Reason:** " + err.reason}}).then(m => msg.guild.playlist.qmessage = null); //edit the qmessage with the error
                else
                    msg.channel.send("", {embed: {title: "⚠ Error queuing Soundclud playlist.", color: 16106519, description: "**Reason:** " + err.reason}}).then(m => msg.guild.playlist.qmessage = null); //send the error message
                
                console.log("Error queing Soundclud playlist in " + msg.guild.name + "\n" + err.err);
            }).finally(() => msg.guild.playlist.qing = false); //let people queue music again.
        }
        
        function spotify(){
            if(!msg.client.spotify.expiry || msg.client.spotify.expiry-200 < Date.now()){
                return msg.client.spotify.clientCredentialsGrant().then(data => {
                    msg.client.spotify.expiry = Date.now() + data.body['expires_in'];
                    msg.client.spotify.setAccessToken(data.body['access_token']);
                    msg.client.commands.find(c => c.areYou('play')).run(params);
                });
             }
            let songId = null;
            let playlistId = null;
            let user = null;
            let albumId = null;
            if(args.match(/user(\/|:)/g) && args.match(/playlist(\/|:)/g)){
                user = args.match(/user(\/|:).[^\/: \n]*/g)[0].replace(/user(\/|:)/g, "");
                playlistId = args.match(/playlist(\/|:).[^\/: \n]*/g)[0].replace(/playlist(\/|:)/g,"")
            }
            else if(args.match(/track(\/|:)/g))
                songId = args.match(/track(\/|:).[^\/: \n]*/g)[0].replace(/track(\/|:)/g,"");
            else if(args.match(/album(\/|:)/g))
                albumId = args.match(/album(\/|:).[^\/: \n]*/g)[0].replace(/album(\/|:)/g,"");
            else
                return msg.channel.send("That doesn't look like a valid spotify url.");
    
            new Promise(function(resolve, reject){
                msg.guild.playlist.qing = true;
    
                if(songId){ //if we're after a song
                    let qm = msg.channel.send("",{embed: {title: "🔎 Searching for track ...", color: msg.guild.me.displayColor}}).then(qm => {
                        msg.guild.playlist.qmessage = qm;
                        msg.client.spotify.getTrack(songId).then(data => {
                            if(!data || !data.body)
                                return reject({err: "Song data not returned.", reason:"Error getting track from Spotify."});
                            qm.edit("",{embed: {title: "⌛ Queueing track ...", color: msg.guild.me.displayColor}}).then(qm => {
                                msg.guild.playlist.qmessage = qm;
                                msg.guild.playlist.textChannel = msg.channel;
                                var title = data.body.album.artists[0].name + " - " + data.body.name;
                                var song = {type: "spotify", title, duration: data.body.duration_ms/1000};
                                msg.guild.playlist.addSong(song, playNext);
                                resolve(song);
                            });//end of second qm
                        }).catch(err => reject({err:"Error getting spotify track in " + msg.guild.name +"\n" + err, reason: "Error getting track from spotify."}));
                    });//end of first qm                
                }else if (albumId){ //if we're after an album
                    let originalN = msg.guild.playlist.queue.length;
                    let qm = msg.channel.send("",{embed: {title: "🔎 Searching for album ...", color: msg.guild.me.displayColor}}).then(qm => {
                        msg.guild.playlist.qmessage = qm;
                        msg.client.spotify.getAlbum(albumId).then(data => {
                            if(!data || !data.body.tracks || data.body.tracks.items.length == 0)
                                return reject({err: "Error getting spotify album in " + msg.guild.name + "\nNo tracks present", reason: "Error getting tracks from album."});
                            qm.edit("",{embed: {title: "⌛ Queueing songs from album ...", color: msg.guild.me.displayColor}}).then(qm => {
                                msg.guild.playlist.qmessage = qm;
                                msg.guild.playlist.textChannel = msg.channel; 
                                data.body.tracks.items.forEach(track => {
                                    var title = track.artists[0].name + " - " + track.name
                                    msg.guild.playlist.addSong({type: "spotify", title, duration: track.duration_ms/1000}, false);
                                });
                                resolve({tracks: msg.guild.playlist.queue.length-originalN, title: data.body.name});
                            });//end of second qm
                        }).catch(err => reject({err:"Error getting spotify album in " + msg.guild.name +"\n" + err, reason: "Error getting album from Spotify."}));
                    });//end of first qm
                }else{ //if we're after a playlist
                    let originalN = msg.guild.playlist.queue.length;
                    let qm = msg.channel.send("",{embed: {title: "🔎 Searching for playlist ...", color: msg.guild.me.displayColor}}).then(qm => {
                        msg.guild.playlist.qmessage = qm;
                        msg.client.spotify.getPlaylist(user, playlistId).then(data => {
                            if(!data || !data.body.tracks || data.body.tracks.items.length == 0)
                                return reject({err: "Error getting spotify playlist in " + msg.guild.name + "\nNo tracks present", reason: "Error getting tracks from playlist."});
                            qm.edit("",{embed: {title: "⌛ Queueing songs from playlist ...", color: msg.guild.me.displayColor}}).then(qm => {
                                msg.guild.playlist.qmessage = qm;
                                msg.guild.playlist.textChannel = msg.channel;
                                data.body.tracks.items.forEach(track => {
                                    var title = track.track.artists[0].name + " - " + track.track.name
                                    msg.guild.playlist.addSong({type: "spotify", title, duration: track.track.duration_ms/1000}, false);
                                });
                                resolve({tracks: msg.guild.playlist.queue.length-originalN, title: data.body.name});
                            });//end of second qm
                        }).catch(err => reject({err: "Error getting spotify playlist in " + msg.guild.name +"\n" + err, reason: "Error getting playlist from Spotify."}));
                    });//end of first qm
                }
            }).then(song => { //the .then takes care of sending the queued message and joining the channel.
                msg.guild.playlist.sendQueueMessage(msg, song);
                if(!msg.guild.voiceConnection) //join the channel and play first song if it's the first one in the queue
                    channel.join().then(conn => msg.guild.playlist.playNext());
            }).catch(err => { //takes care of any errors that might've happened
                if(msg.guild.playlist.qmessage)
                    msg.guild.playlist.qmessage.edit("", {embed: {title: "⚠ Error queuing Spotify track.", color: 16106519, description: "**Reason:** " + err.reason}}).then(m => msg.guild.playlist.qmessage = null); //delete the "searching for" messaging
                else
                    msg.channel.send("", {embed: {title: "⚠ Error queuing Spotify track.", color: 16106519, description: "**Reason:** " + err.reason}}).then(m => msg.guild.playlist.qmessage = null); //delete the "searching for" messaging
    
                console.log(err.err);
            }).finally(() => msg.guild.playlist.qing = false);
        }

        function getDurationString(time){
            var date = new Date(null);
            date.setSeconds(time); // specify value for SECONDS here
            return date.toISOString().substr(11, 8);
        }
    }
}
