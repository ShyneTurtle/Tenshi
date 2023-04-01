const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require("discord.js");
const Discord = require("discord.js");
const crypto = require("node:crypto");
const JsonArrayManager = require(`${__dirname}/../../modules/JsonArrayManager.js`);

let descriptor = new SlashCommandBuilder()
    .setName("plainte")
    .setDescription(`Envoie une plainte annonyme aux MJ pour améliorer le RP ou dénoncer un comportement inapproprié.`)
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addStringOption(opt => opt
        .setName("content")
        .setDescription("Le contenu de la plainte.")
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(3800)
    );

/** @param interaction {ChatInputCommandInteraction} */
let execute = async (interaction, data) => {
    let { config } = data;

    // Verifier que un contenu a été fourni
    if (!interaction.options.getString("content", true)) {
        return interaction.reply({
            embeds: [{
                title: `❌ Veuillez fournir un contenu pour votre plainte.`,
                description: `REPORT_OPTION_CONTENT_INVALID`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
    }

    // Créer le report et l'enregistrer
    let list = new JsonArrayManager(`${__dirname}/../../../data/reports.json`, 2);
    let report = {
        id: Buffer.from(`${list.array.length}`).toString("base64"),
        author: `${interaction.user.tag} (${interaction.user.id})`,
        content: [interaction.options.getString("content", true)],
    };
    list.array.push(report);
    list.save();
    delete list;

    // Si le message est trop long pour afficher en 1seul message, le couper en 2
    if (report.content[0].length >= 1900) {
        report.content[1] = report.content[0].substring(1900);
        report.content[0] = report.content[0].substring(0, 1900);
    }

    // Envoi de la plainte dans le channel
    /**
     * @param chn {Discord.TextChannel}
    */
    interaction.guild.channels.fetch("1091758767651168377")
    .then((chn) => {
        chn.send(`**Plainte n°${report.id}:** ${report.content[0]}`).catch(console.error);
        if (report.content[1]) chn.send(report.content[1]).catch(console.error);
    })
    .catch(console.error);

    // Répondre à l'interaction
    interaction.reply({
        embeds: [{
            title: `✅ Plainte envoyée.`,
            color: Discord.Colors.Green,
        }],
        ephemeral: true,
    }).catch(console.error);
};

module.exports = {
    descriptor,
    execute
};