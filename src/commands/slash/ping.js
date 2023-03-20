const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, Colors } = require("discord.js");

let descriptor = new SlashCommandBuilder()
    .setName("ping")
    .setDescription(`Renvoie le ping du bot, utile pour vérifier si le bot est en ligne.`)
    .setDMPermission(true);

/** @param interaction {ChatInputCommandInteraction} */
let execute = async (interaction, data) => {
    let { utils } = data;

    // Send a response to calculate the ping
    let d1 = Date.now();
    let sent = await interaction.reply({
        embeds: [{
            title: `Calcul du ping...`,
            footer: {
                text: `Serveur: ${interaction.client.ws.gateway}              Statut: ${interaction.client.ws.status}`
            },
            color: Colors.Aqua,
        }],
        //ephemeral: true,
    }).catch(console.error);
    let d2 = Date.now();

    // Calculate the ping
    let ping = Math.round((d2 - d1) / 2);
    // Calculate the color depending on the ping
    let rgb = utils.greenRedGradient(130, 400, ping);

    // Edit the response to display the ping
    interaction.editReply({
        embeds: [{
            title: `📶 Le ping du bot est: ${ping}ms`,
            footer: {
                text: `Serveur: ${interaction.client.ws.gateway}              Statut: ${interaction.client.ws.status}`
            },
            color: utils.hexToDec(utils.rgbToHex(rgb.r, rgb.g, rgb.b))
        }],
        //ephemeral: true,
    }).catch(console.error);
};

module.exports = {
    descriptor,
    execute
};