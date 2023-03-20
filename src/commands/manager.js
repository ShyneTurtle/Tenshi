const Discord = require('discord.js');
const fs = require("node:fs");
const config = require(`${__dirname}/../config.json`);

let slash_command_list = new Discord.Collection();
let user_command_list = new Discord.Collection();
let message_command_list = new Discord.Collection();
async function fetchCommands() {
    // Read the names of the commands
    let slash_name_list = fs.readdirSync(`${__dirname}/slash/`)
        .map((v) => v.replace(/\.[^/.]+$/, "")); // Remove the file extention
    let user_name_list = fs.readdirSync(`${__dirname}/user/`)
        .map((v) => v.replace(/\.[^/.]+$/, "")); // Remove the file extention
    let message_name_list = fs.readdirSync(`${__dirname}/message/`)
        .map((v) => v.replace(/\.[^/.]+$/, "")); // Remove the file extention

    // Loop over each command and read the file
    for (const elem of slash_name_list) {
        // Get the latest version of the command (bypass caching)
        delete require.cache[require.resolve(`${__dirname}/slash/${elem}.js`)];
        slash_command_list.set(elem, require(`${__dirname}/slash/${elem}.js`));
    }
    for (const elem of user_name_list) {
        // Get the latest version of the command (bypass caching)
        delete require.cache[require.resolve(`${__dirname}/user/${elem}.js`)];
        user_command_list.set(elem, require(`${__dirname}/user/${elem}.js`));
    }
    for (const elem of message_name_list) {
        // Get the latest version of the command (bypass caching)
        delete require.cache[require.resolve(`${__dirname}/message/${elem}.js`)];
        message_command_list.set(elem, require(`${__dirname}/message/${elem}.js`));
    }

    // Parse the values of the command list into API-Acceptable JSON
    const slash_parsed_list =
        !slash_command_list.findKey(v => !v.descriptor)
            ? [...slash_command_list.values()].map(v => v.descriptor.toJSON())
            : [];
    const user_parsed_list =
        !user_command_list.findKey(v => !v.descriptor)
            ? [...user_command_list.values()].map(v => v.descriptor.toJSON())
            : [];
    const message_parsed_list =
        !message_command_list.findKey(v => !v.descriptor)
            ? [...message_command_list.values()].map(v => v.descriptor.toJSON())
            : [];

    // Make the global list
    const global_parsed_list = [
        ...slash_parsed_list,
        ...user_parsed_list,
        ...message_parsed_list,
    ];

    // Create a REST connection
    const REST = new Discord.REST({ version: '10' }).setToken(config.bot_token);

    // Send the updated commands to the API
    try {
        let data = await REST.put(
            Discord.Routes.applicationCommands(config.app_id),
            { body: global_parsed_list }
        );

        console.info(`[COMMAND] Successfully reloaded ${data.length} application (/) commands.`);
    } catch (err) {
        console.error(err);
    }
}

// Load commands on startup and refresh on edits
fetchCommands();
fs.watch(`${__dirname}/`, {
    persistent: true,
}, fetchCommands);


/**@param interaction {Discord.CommandInteraction} */
module.exports = async (interaction, _data) => {
    let command, payload = { config, fetchCommands, ..._data };

    // Slash Commands
    if (interaction.isChatInputCommand())
        command = slash_command_list.get(interaction.commandName);

    // User Commands
    else if (interaction.isUserContextMenuCommand())
        command = user_command_list.get(interaction.commandName);

    // Message Commands
    else if (interaction.isMessageContextMenuCommand())
        command = message_command_list.get(interaction.commandName);

    // Invalid interaction type
    else
        return console.error(`[COMMAND] Command type invalid: ${interaction}`)

    // Not found command
    if (!command)
        return console.error(`[COMMAND] No command found. Command name: ${interaction.commandName}`);

    // Run the command
    try {
        await command.execute(interaction, payload);
    } catch (error) {
        console.error(`[COMMAND] Failed to execute command "${interaction.commandName}".`, error);
    }
};