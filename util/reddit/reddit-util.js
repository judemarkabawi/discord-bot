const Discord = require("discord.js");

const snoowrap = require("snoowrap");
const redditsaver = require("./reddit-saver.js");
const Reddit = new snoowrap({
    userAgent: "Discord: chad-thunder-bot",
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    refreshToken: process.env.REDDIT_REFRESH_TOKEN
});

/* Get JQuery stuff ready*/
var jsdom = require("jsdom");
const {JSDOM} = jsdom;
const {window} = new JSDOM();
const {document} = (new JSDOM('')).window;
global.document = document;
var $ = jQuery = require('jquery')(window);

/* Create a reddit saver that saves 100 post id's per subreddit and
clear all subreddits after 30 minutes*/
var redditSaver = new redditsaver.RedditSaver(Reddit, 100);
var clearPosts = setInterval(function() {
    redditSaver.subreddits = {};
}, 1.8e+6);

/* Context is the message that the user sent in the Discord chat, allowing for this file to be 
   able to send a message in the same folder.*/

/* Handles functionality of the reddit r command.*/
exports.processRandomCommand = async function processRandomCommand(subredditName, context) {
    try {
        if (!await redditSaver.isSaved(subredditName)) {
            var botMessage = await context.channel.send("Saving more posts from that subreddit for faster access...");
            await redditSaver.save(subredditName);
            await botMessage.delete();
        }

        let randomPost = await redditSaver.getRandomPost(subredditName);
        await printRedditPost(randomPost, context);
    } catch (e) {
        context.channel.send("That subreddit does not exist, please try again.");
    }
}

/* Handles functionality of the reddit u command. */
exports.processUrlCommand = async function processUrlCommand(url, context) {
    try {
        let botMessage = await context.channel.send("Retrieving that post...");
        var post;

        let urlJSON = url + ".json";
        await $.getJSON(urlJSON, async function(data) {
            // get post ID from the reddit link JSON and get the post object at that ID

            let id = data[0].data.children[0].data.id;
            post = await Reddit.getSubmission(id);
        });

        await botMessage.delete();

        await printRedditPost(post, context);

    } catch (e) {
        context.channel.send("Error.");
    }
}

/* Returns pieces of what the bot should say if it's a real post.*/
async function getPostContent(post) {
    let content = [];
    let text = await post.selftext;
    // split the string into 2000 character strings (to fit in a discord message)
    const SPLIT_AMOUNT = 2000;
    for (var index = 0; index < await text.length - SPLIT_AMOUNT; index += SPLIT_AMOUNT) {
        content.push(text.substr(index, SPLIT_AMOUNT));
    }
    // last piece is < 2000 long and goes to the end of the string.
    content.push(text.slice(index, await text.length));
    return content;
}

/* Returns a Reddit post in embed.*/
async function getEmbedMessage(post, context) {
    let embed = new Discord.RichEmbed();
        embed.setTitle(await post.title.slice(0, 256));
        embed.setAuthor("u/" + await post.author.name, undefined, await post.url);
        embed.setColor(16729344);
        embed.setFooter(await post.subreddit_name_prefixed + " → Score: " + await post.score + " → Requested by " + context.author.username);
    
    return embed;
}

/* Context is the message that the user sent in the Discord chat, allowing for this file to be 
  able to send a message in the same folder. */

/* Prints out the reddit post, requester, etc. */

async function printRedditPost(post, context) {
    // first check if post/ discord channels are NSFW/not\
    if (await post.over_18 && !context.channel.nsfw) {
        context.channel.send("This post is NSFW. Go to an NSFW channel.");
        return;
    }
    
    await context.delete();
  
    let embed = await getEmbedMessage(post, context);
  
    if (await post.selftext.length == 0) {
        // print URL
        await context.channel.send(embed);
        await context.channel.send(await post.url);
    } else {
        // print post
        for (let piece of await getPostContent(post)) {
            embed.setDescription(piece);
            await context.channel.send(embed);
        }
    }
}