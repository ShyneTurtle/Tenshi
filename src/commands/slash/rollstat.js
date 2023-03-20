const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require("discord.js");
const Discord = require("discord.js");
const { google } = require("googleapis");
const sheets = google.sheets("v4");

let descriptor = new SlashCommandBuilder()
    .setName("rollstat")
    .setDescription(`Roll un dé sur une de vos stats et détermine la réussite ou l'échec.`)
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addStringOption(opt => opt
        .setName("stat")
        .setDescription("La statistique à tester.")
        .addChoices(
            { name: "Force", value: "Force" },
            { name: "Intelligence", value: "Intelligence" },
            { name: "Agilité", value: "Agilité" },
            { name: "Charisme", value: "Charisme" },
            { name: "Perception", value: "Perception" },
        )
        .setRequired(true)
    )
    .addStringOption(opt => opt
        .setName("raison")
        .setDescription("La raison du roll. Aide les MJ à déterminer ce qu'il se passe.")
        .setMinLength(2)
        .setMaxLength(200)
        .setRequired(false)
    );

/** @param interaction {ChatInputCommandInteraction} */
let execute = async (interaction, data) => {
    let { config, gauth_client } = data;
    
    // Get the stat name
    if (!interaction.options.getString("stat", true)) {
        return interaction.reply({
            embeds:[{
                title: `❌ Statistique inconnue.`,
                description: `ROLLSTAT_OPTION_STAT_INVALID`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
    }
    let stat_name = interaction.options.getString("stat", true);

    // Get the data sheet
    let target_sheet = await sheets.spreadsheets.get({
        spreadsheetId: config.gapi_sheet_id,
        key: config.gapi_key,
        includeGridData: true,
        ranges: `'Stat perso'!1:7`
    })
    .catch(console.error);
    if (!target_sheet) {
        interaction.reply({
            embeds:[{
                title: `❌ Echec de récupération des données`,
                description: `ROLLSTAT_SHEET_NOT_FOUND`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
        return console.error("[COMMAND ROLLSTAT] ROLLSTAT_SHEET_NOT_FOUND");
    }
    // Get the data tab
    let target_tab = target_sheet?.data?.sheets?.find(v => v.properties.sheetId == config.gapi_sheet_tabid);
    if (!target_tab) {
        interaction.reply({
            embeds:[{
                title: `❌ Echec de récupération des données`,
                description: `ROLLSTAT_SHEET_TAB_NOT_FOUND`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
        return console.error("[COMMAND ROLLSTAT] ROLLSTAT_SHEET_TAB_NOT_FOUND");
    }
    // Get the row data and format it in a 2D array
    let target_data = target_tab?.data[0]?.rowData?.map(v => v.values);
    if (!target_data) {
        interaction.reply({
            embeds:[{
                title: `❌ Echec de récupération des données`,
                description: `ROLLSTAT_DATA_NOT_FOUND`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
        return console.error("[COMMAND ROLLSTAT] ROLLSTAT_DATA_NOT_FOUND");
    }
    // Get the stat line
    let target_line = target_data?.findIndex(v => v[0]?.formattedValue == stat_name);
    if (!target_line || target_line == -1)  {
        interaction.reply({
            embeds:[{
                title: `❌ Statistique invalide`,
                description: `Impossible de trouver la statistique dans les infos RP, veuillez contacter les MJ.\nROLLSTAT_DATA_LINE_NOT_FOUND`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
        return console.error(`[COMMAND ROLLSTAT] ROLLSTAT_DATA_LINE_NOT_FOUND: ${stat_name}`);
    }
    // Get the stat column using the discord id
    let target_column = target_data
        ?.find(v => v[0]?.formattedValue == "ID")
        ?.findIndex(v => v?.formattedValue == interaction.user.id);
    if (!target_column || target_column == -1) {
        interaction.reply({
            embeds:[{
                title: `❌ Personage invalide`,
                description: `Impossible de trouver votre personnage dans les infos RP, veuillez contacter les MJ.\nROLLSTAT_DATA_COLUMN_NOT_FOUND`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
        return console.error(`[COMMAND ROLLSTAT] ROLLSTAT_DATA_COLUMN_NOT_FOUND: ${interaction.user.id}`);
    }
    // Get the stat value
    let stat_value = target_data[target_line][target_column]?.formattedValue;
    if (!stat_value | stat_value <= 0) {
        interaction.reply({
            embeds:[{
                title: `❌ Statistique vide`,
                description: `Impossible de trouver la valeur de statistique demandée pour votre personnage dans les infos RP, veuillez contacter les MJ.\nROLLSTAT_DATA_VALUE_NOT_FOUND`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
        return console.error(`[COMMAND ROLLSTAT] ROLLSTAT_DATA_VALUE_NOT_FOUND: line:[${target_line}] col:[${target_column}]`);
    }

    // Roll 1d100
    let roll_value = Math.round(Math.random() * 100);

    // Get the roll reason
    let roll_reason = interaction.options.getString("raison") ? interaction.options.getString("raison") : "<Aucune raison spécifiée>";

    // Create the embed
    /** @type {Discord.Embed} */
    let roll_embed = {
        title: `Roll de ${interaction.member.displayName} | 1d100`,
        description: `Salon d'origine: ${interaction.channel}\nRaison: ${roll_reason}`,
        fields: [{
            name: `Jet de ${interaction.options.getString("stat", true)}`,
            value: `${roll_value <= stat_value ? "✅ Réussite" : "❌ Echec"} (${roll_value})`,
        }],
        color: Discord.Colors.Aqua,
    };

    // Send message in the origin channel and then delete it after 5m if the channel is not #roll-the-dice
    interaction.reply({ embeds: [roll_embed] }).catch(console.error)
        .then(msg => {
            if (interaction.channelId != "1081114506232602676") 
                setTimeout(() => {
                    if (msg) msg.delete().catch(console.error);
                }, 300000);
        });

    // Send message in #roll-the-dice if it is not the origin channel
    if (interaction.channelId != "1081114506232602676") {
        interaction.guild.channels.fetch("1081114506232602676").then(chn => {
            chn.send({ embeds: [roll_embed] }).catch(console.error);
        }).catch(console.error);
    }
};

module.exports = {
    descriptor,
    execute
};