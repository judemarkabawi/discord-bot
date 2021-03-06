/**
 * Defines the ping command.
 *
 * Informs the user of what the latency is between the server and the bot.
 *
 * @author Jude Markabawi, Stanley Wang.
 * @license See the LICENSE file for details.
 */

const embedTool = require("../util/embed-message-tool.js");

exports.run = async (client, message, args) => {
    // calculates the time difference between when user's message was sent and when the bot sent one back
    let responseMessage = await message.channel.send("Pinging...");
    let latency = responseMessage.createdTimestamp - message.createdTimestamp;

    // if negative latency error happens, try again
    while (latency < 0) {
        responseMessage.delete();
        responseMessage = await message.channel.send("Pinging again...");
        latency = responseMessage.createdTimestamp - message.createdTimestamp;
    }

    let embed = embedTool.createMessage("Ping",
                                        latency + " ms" + "\n\nGood enough?",
                                        "ping loading",
                                        false);
    responseMessage.edit(embed);
}

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: "ping",
    description: "Returns how long it takes for Chad to send a message back.",
    usage: "ping"
};
