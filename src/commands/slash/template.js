const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require("discord.js");
const Discord = require("discord.js");

let descriptor = new SlashCommandBuilder()
    .setName("template")
    .setDescription(`Commande vide. Seulement visible par les admins.`)
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

/** @param interaction {ChatInputCommandInteraction} */
let execute = async (interaction, data) => {
    let { config } = data;


};

module.exports = {
    descriptor,
    execute
};