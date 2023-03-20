const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require("discord.js");
const Discord = require("discord.js");
const JsonMapManager = require(`${__dirname}/../../modules/JsonMapManager.js`);

let descriptor = new SlashCommandBuilder()
    .setName("eco")
    .setDescription(`Commande admin de gestion de l'économie.`)
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub
        .setName("get")
        .setDescription("Consulte le solde d'un joueur.")
        .addMentionableOption(opt => opt
            .setName("utilisateur")
            .setDescription("L'utilisateur cible.")
            .setRequired(true)
        )
    )
    .addSubcommand(sub => sub
        .setName("give")
        .setDescription("Donne de l'argent à un joueur.")
        .addMentionableOption(opt => opt
            .setName("utilisateur")
            .setDescription("L'utilisateur à créditer.")
            .setRequired(true)
        )
        .addIntegerOption(opt => opt
            .setName("quantité")
            .setDescription("Quantité à créditer.")
            .setRequired(true)
            .setMinValue(0)
        )
    )
    .addSubcommand(sub => sub
        .setName("take")
        .setDescription("Retire de l'argent à un joueur.")
        .addMentionableOption(opt => opt
            .setName("utilisateur")
            .setDescription("L'utilisateur a débiter.")
            .setRequired(true)
        )
        .addIntegerOption(opt => opt
            .setName("quantité")
            .setDescription("Quantité à débiter.")
            .setRequired(true)
            .setMinValue(0)
        )
    )
    .addSubcommand(sub => sub
        .setName("set")
        .setDescription("Définit l'argent d'un joueur.")
        .addMentionableOption(opt => opt
            .setName("utilisateur")
            .setDescription("L'utilisateur a éditer.")
            .setRequired(true)
        )
        .addIntegerOption(opt => opt
            .setName("quantité")
            .setDescription("Nouveau solde du joueur.")
            .setRequired(true)
            .setMinValue(0)
        )
    );

/** @param interaction {ChatInputCommandInteraction} */
let execute = async (interaction, data) => {
    let { config } = data;

    if (!interaction.options.getMentionable("utilisateur", true)) {
        return interaction.reply({
            embeds: [{
                title: `❌ Veuillez fournir un utilisateur.`,
                description: `ECO_OPTION_USER_INVALID`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
    }
    let target_list = interaction.options.getMentionable("utilisateur", true);
    if (target_list instanceof Discord.User)
        target_list = [target_list];
    if (target_list instanceof Discord.GuildMember)
        target_list = [target_list.user];
    if (target_list instanceof Discord.Role)
        target_list = target_list.members.map(v => v.user);


    let target_amount;
    switch (interaction.options.getSubcommand(true)) {
        case "give":
        case "take":
        case "set":
            if (!interaction.options.getInteger("quantité", true)) {
                return interaction.reply({
                    embeds: [{
                        title: `❌ Veuillez fournir une quantité.`,
                        description: `ECO_OPTION_QUANTITY_INVALID`,
                        color: Discord.Colors.Red,
                    }],
                    ephemeral: true,
                }).catch(console.error);
            }
            target_amount = interaction.options.getInteger("quantité", true);
            break;
    }


    let money_db = new JsonMapManager(`${__dirname}/../../../data/money.json`);

    for (const target_user of target_list) {

        if (!money_db.get(target_user.id))
            money_db.set(target_user.id, 0);
    
        switch (interaction.options.getSubcommand(true)) {
            case "get":
                interaction.followUp({
                    embeds: [{
                        title: `💵 Verification de solde:`,
                        description: `Solde de ${target_user}: ${money_db.get(target_user.id)} Ecus`,
                        color: Discord.Colors.Aqua,
                    }]
                }).catch(console.error);
                break;
    
            case "give":
                money_db.set(target_user.id, money_db.get(target_user.id) + target_amount);
    
                interaction.followUp({
                    embeds: [{
                        title: `✅ ${target_amount} Ecus crédités.`,
                        description: `Nouveau solde de ${target_user}: ${money_db.get(target_user.id)} Ecus`,
                        color: Discord.Colors.Green,
                    }]
                }).catch(console.error);
                break;
    
            case "take":
                money_db.set(target_user.id, money_db.get(target_user.id) - target_amount);
    
                interaction.followUp({
                    embeds: [{
                        title: `✅ ${target_amount} Ecus débités.`,
                        description: `Nouveau solde de ${target_user}: ${money_db.get(target_user.id)} Ecus`,
                        color: Discord.Colors.Green,
                    }]
                }).catch(console.error);
                break;
            case "set":
                money_db.set(target_user.id, target_amount);
    
                interaction.followUp({
                    embeds: [{
                        title: `✅ Solde défini.`,
                        description: `Le solde de ${target_user} à été défini à ${target_amount}`,
                        color: Discord.Colors.Green,
                    }]
                }).catch(console.error);
                break;
    
            default:
                interaction.followUp({
                    embeds: [{
                        title: `❌ Veuillez fournir une commande valide.`,
                        description: `ECO_SUBCOMMAND_NOT_FOUND`,
                        color: Discord.Colors.Red,
                    }],
                    ephemeral: true,
                }).catch(console.error);
                break;
        }
    }

    money_db.save();
};

module.exports = {
    descriptor,
    execute
};