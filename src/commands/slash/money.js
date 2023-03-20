const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require("discord.js");
const Discord = require("discord.js");
const JsonMapManager = require(`${__dirname}/../../modules/JsonMapManager.js`);

let descriptor = new SlashCommandBuilder()
    .setName("money")
    .setDescription(`Permet de consulter votre solde en écu.`)
    .setDMPermission(false);

/** @param interaction {ChatInputCommandInteraction} */
let execute = async (interaction, data) => {
    let { config } = data;
    
    let money_db = new JsonMapManager(`${__dirname}/../../../data/money.json`);

    // Create entries in the map 
    if (!money_db.get(interaction.user.id)) {
        money_db.set(interaction.user.id, 0);
        money_db.save();
    }
    
    interaction.reply({
        embeds:[{
            title: `Solde de ${interaction.member.displayName}: ${money_db.get(interaction.user.id)} Ecus.`,
            color: Discord.Colors.Aqua,
        }],
        ephemeral: true,
    }).catch(console.error);
};

module.exports = {
    descriptor,
    execute
};