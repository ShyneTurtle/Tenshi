const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require("discord.js");
const Discord = require("discord.js");
const sms_cmd = require(`${__dirname}/../common/sms.js`);

let descriptor = new SlashCommandBuilder()
    .setName("sms")
    .setDescription(`envoie un sms à un joueur.`)
    .setDMPermission(false)
    .addMentionableOption(opt => opt
        .setName("destinataire")
        .setDescription("Le/les destinataires du sms.")
        .setRequired(true)
    );

/** @param interaction {ChatInputCommandInteraction} */
let execute = async (interaction, data) => {
    let { config } = data;

    sms_cmd(interaction, interaction.options.getMentionable("destinataire", true), data);
};

module.exports = {
    descriptor,
    execute
};