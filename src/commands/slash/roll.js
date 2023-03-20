const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require("discord.js");
const Discord = require("discord.js");

let descriptor = new SlashCommandBuilder()
    .setName("roll")
    .setDescription(`Roll un dé et donne le résultat ici et dans #roll-the-dice.`)
    .setDMPermission(false)
    .addIntegerOption(opt => opt
        .setName("dés")
        .setDescription("Nombre de dés.")
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(true)
    )
    .addIntegerOption(opt => opt
        .setName("faces")
        .setDescription("Nombre de faces du dé.")
        .setMinValue(2)
        .setMaxValue(1000)
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
    let { config } = data;

    // Get the dice count
    if (!interaction.options.getInteger("dés", true)) {
        return interaction.reply({
            embeds: [{
                title: `❌ Veuillez préciser un nombre de dés.`,
                description: `ROLL_OPTION_DICE_INVALID`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
    }
    let dice_count = interaction.options.getInteger("dés", true);

    // Get the roll faces
    if (!interaction.options.getInteger("faces", true)) {
        return interaction.reply({
            embeds: [{
                title: `❌ Veuillez préciser un nombre de faces.`,
                description: `ROLL_OPTION_FACES_INVALID`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
    }
    let roll_faces = interaction.options.getInteger("faces", true);

    // Get the roll reason
    let roll_reason = interaction.options.getString("raison") ? interaction.options.getString("raison") : "<Aucune raison spécifiée>";

    // Calculate the roll values
    let roll_values = [];
    for (let i = 0; i < dice_count; i++)
        roll_values[i] = Math.round(Math.random() * roll_faces);

    // Create the embed
    /** @type {Discord.Embed} */
    let roll_embed = {
        title: `Roll de ${interaction.member.displayName} | ${dice_count}d${roll_faces}`,
        description: `Salon d'origine: ${interaction.channel}\nRaison: ${roll_reason}`,
        fields: roll_values.map((v, i) => { return { name: `Dé N°${i + 1} :`, value: `${v}` } }),
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