//Uses discord.js and makes a client to login with along with library setup
const Discord = require('discord.js');
const puppeteer = require('puppeteer');
const bot = new Discord.Client();
require('dotenv').config();

//token required to log in bot to a server (token is the name of the bot essentially)
const token = process.env.TOKEN;
bot.login(token);

//bot is called on with '!' and bot checks messages for '! constantly
const call = '!';
bot.on('message', function (message) {
    //if "!" is used, splits message into array based on the spaces
    let args = message.content.substring(call.length).split(" ");

    //if the first word in the substring is 'potato' or whatever, do the actions below
    switch (args[0]){

        //roast function
        case 'roast':
            //if the user hasnt written !roast @"name of person", give error and return
            if (typeof args[1] != "string" || args[1].search("@") != 1) return message.reply ('write the name of the inter, you idiot!')
            //roasts are inputted in an array and accessed randomly to output
            var roasts = [
                "if I wanted to kill myself, I'd jump up to your ego and jump down to your IQ.",
                "I'd call you cancer but at least cancer gets kills.",
                "map awareness level: Christopher Columbus.",
                "how did you even get passed the login screen?",
                "not even Olaf ult could prevent you from being disabled."
            ];
            var num = Math.floor(Math.random() * 5);
            message.channel.send(args[1]+', '+roasts[num]);
            break;

        //clear function
        case 'clear':
            if (!args[1]) return message.reply('error')
            message.channel.bulkDelete(args[1]);
            break;

        //op.gg stats checker
        case 'stats':
            for (var i = 1; args.length > i; i++){
                if (typeof args[i] != "string" || args.length < 1) return message.channel.send('must input username. Ex: !stats username')    
            }
            
            var name = args[1];
            for (var n=2; args.length>n; n++){
                name = name + "%20" + args[n];
            }
            
            async function website(url){
                try{
                    const browser = await puppeteer.launch();
                    const page =  await browser.newPage();
                    await page.goto (url)
    
                    const statEL = await page.evaluate(() => document.querySelector('div.TierRankInfo').innerText);
                    const statTxt = await   statEL.split("\n").join(" ").split(" ");
    
                    const [profileEL] = await Promise.race([
                        page.$x('/html/body/div[2]/div[3]/div/div/div[1]/div[1]/div/img'),
                        page.$x('/html/body/div[2]/div[3]/div/div/div[1]/div[2]/div/img')
                    ]);
                    const profileSrc = await profileEL.getProperty('src');
                    const profilePic = await profileSrc.jsonValue();
    
                    const [rankEL] = await page.$x('//*[@id="SummonerLayoutContent"]/div[2]/div[1]/div[1]/div/div[1]/img');
                    const rankSrc = await rankEL.getProperty('src');
                    const rankPic = await rankSrc.jsonValue();
    
                    const nameEL = await page.evaluate(() => document.querySelector('span.Name').innerText);
    
                    const click = await page.$('#right_match');
                    await click.evaluate(click => click.click());  
                    
                    await page.waitForSelector('#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.RealContent > div > div.Content > div.GameItemList > div:nth-child(1) > div > div.GameDetail > div > div.MatchDetailContent.tabItems > div.Content.tabItem.MatchDetailContent-overview > div > table.GameDetailTable.Result-LOSE > tbody > tr.Row.last');
                    const lastMatch = await page.$('#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.RealContent > div > div.Content > div.GameItemList > div:nth-child(1) > div');
                    await lastMatch.screenshot({path: 'match-history.png'});
    
                    if(statEL.search('Unranked') == -1){
                        var embed = new Discord.MessageEmbed()
                        .setTitle(nameEL)
                        .addFields(
                            {name: 'Rank', value: statTxt[2]+" "+statTxt[3], inline: true},
                            {name: 'League Points', value: statTxt[4]+" "+statTxt[5], inline: true},
                            {name: 'Wins/Losses', value: statTxt[7]+"/"+statTxt[8], inline: true},
                            {name: 'Win Ratio', value: statTxt[11], inline: true}
                        )
                        .setThumbnail(rankPic)
                    }
                    else{
                        var embed = new Discord.MessageEmbed()
                        .setTitle(nameEL)
                        .addFields(
                            {name: 'Rank', value: 'Unranked', inline: true},
                            {name: 'League Points', value: 'n/a', inline: true},
                            {name: 'Wins/Losses', value: 'n/a', inline: true},
                            {name: 'Win Ratio', value: 'n/a', inline: true}
                        )
                        .setThumbnail(rankPic)
                    }
        
                    message.channel.send(embed)
                    message.channel.send({files: ["match-history.png"]})
    
                    await browser.close();
                }
                catch(err){
                    message.channel.send('Oops! Something went wrong...')
                    await browser.close()
                }
            }
            website('https://na.op.gg/summoner/userName='+name);
            break;
    }
});
