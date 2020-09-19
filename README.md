# Leauge-Bot
This bot is being made for my friend's discord server to allow them to find League of Legends stats at the click of a button. Requires the Puppeteer and Discord API.

All content utilized in this chatbot is based on content retreived from op.gg.

## How to use the bot

There are several commands that can be used with this chatbot, mostly surrounding things in League of Legends:



### `!roast [discord username]`

This function will extract an insult (all league of legends based) from an array at random and reply to the user being roasted using Discord API's `message.reply()` command:

![](sample_images/roast.PNG)



### `!stats [league username]`

This function will use the Puppeteer API to webscrape stat information from OP.GG's DOMs for the username mentioned. It will then output it to the Discord chat via the Discord API's `message.channel.send()` command:

![](sample_images/stats.PNG)



### `!commands`

Your trusty command helper!

![](sample_images/commands.PNG)
