const Discord = require('discord.js'); //Discord API for sending messages and activating the bot
const puppeteer = require('puppeteer'); //Puppeteer API for webscraping
require('dotenv').config(); //token hiding

//Contacts discord client to activate the bot and call is set to !
const bot = new Discord.Client();
bot.login(process.env.TOKEN);
const call = '!';

//bot parses messages based on spaces when call is active inside message body
bot.on('message', function (message) {
    console.log('bot is online!');
    let args = message.content.split(" ");

    //help function
    if(args[0].search('!') != -1){
        if (args[0] === '!commands'){
            const commandList = [
                "`!roast [@username]` - Is someone being stupid? Roast them!\n\n",
                "`!stats [league username]` - Checks a player's match history and their stats!\n\n",
                "`!commands` - Your trusty command helper!"
            ];
            const helpEmbed = new Discord.MessageEmbed()
                .setColor('#F34C3F')
                .setTitle('List of Commands:')
                .setDescription(commandList[0]+commandList[1]+commandList[2]+commandList[3])
            message.reply(helpEmbed);
        }
    
        //roast function
        else if (args[0] === '!roast'){
            //if the user hasnt written !roast @"name of person", give error and return
            if (typeof args[1] != "string" || args[1].search("@") != 1){
                return message.reply('Uh oh, you did not write a valid name...');
            }
            
            var roasts = [
                "if I wanted to kill myself, I'd jump up to your ego and jump down to your IQ.",
                "I'd call you cancer but at least cancer gets kills.",
                "map awareness level: Christopher Columbus.",
                "how did you even get passed the login screen?",
                "not even Olaf ult could prevent you from being disabled."
            ];
            var num = Math.floor(Math.random() * 5); //number should be changed depending on how many roasts are in array
            message.channel.send(args[1]+', '+roasts[num]);
        }
        
        //stats function
        else if(args[0] === '!stats'){
            //check if user entered a username, then creates link
            for (var i = 1; args.length > i; i++){
                if (typeof args[i] != "string" || args.length < 1){
                    return message.reply('you must input username (Ex: !stats [league username])'); 
                }   
            }
    
            var name = args[1];
            for (var n=2; args.length>n; n++){
                name = name + "%20" + args[n];
            }
            
            //async function for webscraping
            async function website(url){
                const browser = await puppeteer.launch(); //initialize puppeteer headless browser
                const page =  await browser.newPage(); //start new page
                await page.goto (url); //input link into browser
    
                //stats collection (array)
                const statEL = await page.evaluate(() => document.querySelector('div.TierRankInfo').innerText)
                    .catch((err)=>{
                        message.reply("Uh oh..." + message.content.substring(6) + " is not a player..."); //if info cannot be retrieved, league name is invalid, thus exit
                        return
                    });
                const statTxt = await   statEL.split("\n").join(" ").split(" ");
                
                //rank collection (img link)
                const [rankEL] = await page.$x('//*[@id="SummonerLayoutContent"]/div[2]/div[1]/div[1]/div/div[1]/img');
                const rankSrc = await rankEL.getProperty('src');
                const rankPic = await rankSrc.jsonValue();    
    
                //name collection (array)
                const nameEL = await page.evaluate(() => document.querySelector('span.Name').innerText);
    
                //activate the javascript to reach the match history of the page
                const click = await page.$('#right_match');
                await click.evaluate(click => click.click());  
                
                //wait for it to load then screenshot
                await page.waitForSelector('#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.RealContent > div > div.Content > div.GameItemList > div:nth-child(1) > div > div.GameDetail > div > div.MatchDetailContent.tabItems > div.Content.tabItem.MatchDetailContent-overview > div > table.GameDetailTable.Result-WIN > tbody > tr.Row.last > td.Items.Cell');
                await page.waitFor(25)
                const lastMatch = await page.$('#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.RealContent > div > div.Content > div.GameItemList > div:nth-child(1) > div');
                await lastMatch.screenshot({path: 'match-history.png'});
    
                //create embed then send it along with match
                if(statEL.search('Unranked') == -1){
                    var embed = new Discord.MessageEmbed()
                        .setColor('#A4D057')
                        .setTitle(nameEL)
                        .setURL(url)
                        .setDescription('Click name to learn more.')
                        .addFields(
                            {name: 'Rank', value: statTxt[2]+" "+statTxt[3], inline: true},
                            {name: '\u200B', value: '\u200B', inline: true},
                            {name: 'League Points', value: statTxt[4]+" "+statTxt[5], inline: true},
                            {name: 'Wins/Losses', value: statTxt[7]+"/"+statTxt[8], inline: true},
                            {name: '\u200B', value: '\u200B', inline: true},
                            {name: 'Win Ratio', value: statTxt[11], inline: true},
                        )
                        .setThumbnail(rankPic)
                }
                else{
                    var embed = new Discord.MessageEmbed()
                        .setColor('#A4D057')
                        .setTitle(nameEL)
                        .setURL(url)
                        .setDescription('Click name to learn more.')
                        .addFields(
                            {name: 'Rank', value: 'Unranked', inline: true},
                            {name: '\u200B', value: '\u200B', inline: true},
                            {name: 'League Points', value: 'n/a', inline: true},
                            {name: 'Wins/Losses', value: 'n/a', inline: true},
                            {name: '\u200B', value: '\u200B', inline: true},
                            {name: 'Win Ratio', value: 'n/a', inline: true},
                        )
                        .setThumbnail(rankPic)
                }
                
                message.reply(embed);
                message.channel.send({files: ["match-history.png"]});
    
                await browser.close();
            }
            website('https://na.op.gg/summoner/userName='+name);
        }
        
        //if none of the commands work, resort to this
        else{
            if (args[0].search('@') == -1){
                message.reply("you have not inputted a valid command, type `!commands` for a list of commands.");
            }
        }
    }
});