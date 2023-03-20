const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require("discord.js");
const Discord = require("discord.js");
const JsonMapManager = require(`${__dirname}/../../modules/JsonMapManager.js`);

let descriptor = new SlashCommandBuilder()
    .setName("pay")
    .setDescription(`Donne de l'argent à un autre joueur.`)
    .setDMPermission(false)
    .addUserOption(opt => opt
        .setName("joueur")
        .setDescription("Le joueur à créditer.")
        .setRequired(true)
    )
    .addIntegerOption(opt => opt
        .setName("quantité")
        .setDescription("Quantité à transférer.")
        .setRequired(true)
        .setMinValue(0)
    );

/** @param interaction {ChatInputCommandInteraction} */
let execute = async (interaction, data) => {
    let { config } = data;

    if (!interaction.options.getUser("joueur", true)) {
        return interaction.reply({
            embeds:[{
                title: `❌ Veuillez fournir un joueur à créditer.`,
                description: `PAY_OPTION_PLAYER_INVALID`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
    }
    let target_user = interaction.options.getUser("joueur", true);

    if (!interaction.options.getInteger("quantité", true) || interaction.options.getInteger("quantité", true) < 1) {
        return interaction.reply({
            embeds:[{
                title: `❌ Veuillez fournir une quantité d'argent à transférer.`,
                description: `PAY_OPTION_AMOUNT_INVALID`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
    }
    let target_amount = interaction.options.getInteger("quantité", true);
    

    let money_db = new JsonMapManager(`${__dirname}/../../../data/money.json`);

    // Create entries in the map if needed
    if (!money_db.get(interaction.user.id)) {
        money_db.set(interaction.user.id, 0);
    }
    if (!money_db.get(target_user.id)) {
        money_db.set(target_user.id, 0);
    }

    if (money_db.get(interaction.user.id) - target_amount < 0) {
        interaction.reply({
            embeds:[{
                title: `❌ Votre solde n'est pas suffisant.`,
                description: `PAY_MONEY_INSUFFICIENT`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
    } else {
        money_db.set(interaction.user.id, money_db.get(interaction.user.id) - target_amount);
        money_db.set(target_user.id, money_db.get(target_user.id) + target_amount);

        
        interaction.reply({
            embeds:[{
                title:`✅ Paiement effectué.`,
                description: `${target_amount} Ecus transférés à ${target_user}.`,
                color: Discord.Colors.Green,
            }]
        }).catch(console.error);
    }
    
    money_db.save();
};

module.exports = {
    descriptor,
    execute
};