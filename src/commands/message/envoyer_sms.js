const { ContextMenuCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require("discord.js");
const Discord = require("discord.js");
const sms_cmd = require(`${__dirname}/../common/sms.js`);

let descriptor = new ContextMenuCommandBuilder()
    .setType(Discord.ApplicationCommandType.Message)
    .setName("envoyer_sms")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages);

/** @param interaction {Discord.MessageContextMenuCommandInteraction} */
let execute = async (interaction, data) => {
    let { config } = data;

    sms_cmd(interaction, interaction.targetMessage.author, data);
};

module.exports = {
    descriptor,
    execute
};