const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require("discord.js");
const Discord = require("discord.js");

let descriptor = new SlashCommandBuilder()
    .setName("reload")
    .setDescription(`Met à jour la liste des commandes.`)
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

/** @param interaction {ChatInputCommandInteraction} */
let execute = async (interaction, data) => {
    let { fetchCommands } = data;
    try {
        fetchCommands();

        interaction.reply({
            embeds: [{
                title: `✅ Commandes mises à jour.`,
                color: Discord.Colors.Green,
            }],
            ephemeral: true,
        }).catch(console.error);
    } catch (err) {
        console.error(err);

        interaction.reply({
            embeds: [{
                title: `❌ Echec de la mise à jour.`,
                description: `Raison:\n${JSON.stringify(err)}`,
                fields: receiver_status,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
    }

};

module.exports = {
    descriptor,
    execute
};