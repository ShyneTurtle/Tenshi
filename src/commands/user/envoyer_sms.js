const { ContextMenuCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Discord = require("discord.js");
const sms_cmd = require(`${__dirname}/../common/sms.js`);

let descriptor = new ContextMenuCommandBuilder()
    .setType(Discord.ApplicationCommandType.User)
    .setName("envoyer_sms")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages);

/** @param interaction {Discord.UserContextMenuCommandInteraction} */
let execute = async (interaction, data) => {
    let { config } = data;

    sms_cmd(interaction, interaction.targetUser, data);
};

module.exports = {
    descriptor,
    execute
};