//Uses discord.js and makes a client to login with along with library setup
const Discord = require('discord.js');
const bot = new Discord.Client();
const cheerio = require('cheerio');
const request = require('request');

//token required to log in bot to a server (token is the name of the bot essentially)
const token = 'NzI2NTc1OTg1NDU3MTAyOTY5.XvfY5w.jjSm2W8-pD3vfOw8aC--for3Bms';
bot.login(token);

//bot is called on with '!' and bot checks messages for '! constantly
const call = '!';
bot.on('message', function (message) {
    //if "!" is used, splits message into array based on the spaces
    let args = message.content.substring(call.length).split(" ");

    //if the first word in the substring is 'potato' or whatever, do the actions below
    switch (args[0]){

        case 'help':

        //roast function
        case 'roast':
            //if the user hasnt written !roast @"name of person", give error and return
            if (typeof args[1] != "string" || args[1].search("@") != 1) return message.reply ('write the name of the inter, you idiot!')
            //roasts are inputted in an array and accessed randomly to output
            var roasts = ["if I wanted to kill myself, I'd jump up to your ego and jump down to your IQ.", "I'd call you cancer but at least cancer gets kills.", "map awareness level: Christopher Columbus.", "how did you even get passed the login screen?", "not even Olaf ult could prevent you from being disabled."];
            var num = Math.floor(Math.random() * 5);
            message.channel.send(args[1]+', '+roasts[num]);
            break;

        //clear function
        case 'clear':
            if (!args[1]) return message.channel.send('error')
            message.channel.bulkDelete(args[1]);
            break;

        //op.gg stats checker
        case 'stats':
            for (var i=1; args.length>i; i++){
                if (typeof args[i] != "string" || args.length < 1) return message.channel.send('must input username. Ex: !stats username')    
            }
            
            var name = args[1];
            for (var n=2; args.length>n; n++){
                name = name+"+"+args[n];
            }


            var options = {
                url: "https://na.op.gg/summoner/userName="+name,
                method: "GET",
                headers: {
                    "Accept": "text/html",
                    "User-Agent": "Chrome"
                }
            };
            
            request(options, function(error, response, responseBody) {
                if(error) return message.reply ("Error in grabbing desired stats")

                $ = cheerio.load(responseBody);

                var links = $("body > div.l-wrap.l-wrap--summoner > div.l-container > div > div > div.Header > div.Face > div > img");

                var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("img"));
                console.log(urls);
                if (!urls.length) {
                 // Handle no results
                 return;
                }
            })
           
    }

})

