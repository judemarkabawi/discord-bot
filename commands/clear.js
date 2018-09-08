const embedTool = require("../util/embed-message-tool.js");
exports.run = async (client, message, args) => {
    if (!message.channel.permissionsFor(message.member).has("MANAGE_MESSAGES")) {
        message.channel.send("Sorry, you don't have the permission to execute the command \"" + message.content + "\"");
        return;
    }

    if (isNaN(args[0])) {
        message.channel.send(
            embedTool.createMessage("Invalid Clear Command",
                                    "You need to say how many messages to clear ... how " + "else would I know how many to clear?\n Use "
                                    + "`" + process.env.PREFIX + "help clear` for more info.", 
                                    "confused face", 
                                    true)
        );
        return;
    }

     // delete one extra to remove user's message
    message.channel.bulkDelete(+args[0] + 1);
}
exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: 2
};

exports.help = {
    name: "clear",
    description: "Clears a certain number of messages.",
    usage: "clear <number>"
};
