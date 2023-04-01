const Discord = require("discord.js");
const crypto = require("node:crypto");

/**
 * @param interaction {Discord.CommandInteraction}
 * @param destinataire {Discord.User | Discord.GuildMember | Discord.Role | undefined | null}
 */
module.exports = async (interaction, destinataire, data) => {
    let { config } = data;

    // Verifier qu'un destinataire à été fourni
    if (!destinataire) {
        return interaction.reply({
            embeds: [{
                title: `❌ Veuillez préciser un destinataire.`,
                description: `SMS_OPTION_RECEIVER_INVALID`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
    }

    await interaction.deferReply({ ephemeral: true });

    const new_sms_content = new Discord.TextInputBuilder()
        .setCustomId("new_sms_content")
        .setLabel(`Contenu du SMS:`)
        .setRequired(true)
        .setStyle(Discord.TextInputStyle.Paragraph)
        .setMinLength(2)
        .setMaxLength(3800);

    const new_sms_row = new Discord.ActionRowBuilder()
        .setComponents(new_sms_content);

    const new_sms_modal = new Discord.ModalBuilder()
        .setTitle("Nouveau SMS")
        .setCustomId(crypto.randomUUID())
        .setComponents(new_sms_row);

    // Obtenir tous les destinataires
    let receivers = [];

    if (destinataire instanceof Discord.GuildMember)
        receivers.push(destinataire.user);
    if (destinataire instanceof Discord.User)
        receivers.push(destinataire);
    if (destinataire instanceof Discord.Role)
        receivers.push(...destinataire.members.map(v => v.user));

    if (receivers.length <= 0) {
        interaction.reply({
            embeds: [{
                title: `❌ Aucun destinataires trouvés.`,
                description: `SMS_NO_RECEIVERS`,
                color: Discord.Colors.Red,
            }],
            ephemeral: true,
        }).catch(console.error);
        return console.error(`[COMMAND] Cannot find a receiver for the SMS: ${interaction}`);
    }

    if (interaction.isRepliable())
        await interaction.showModal(new_sms_modal);

    interaction.awaitModalSubmit({ time: 900000, dispose: true, filter: v => v.customId == new_sms_modal.data.custom_id })
        .then((modal_sub) => {
            // Formater les infos sous un format pratique
            let sms = {
                sender: modal_sub.user,
                receivers,
                content: [modal_sub.fields.getField("new_sms_content").value],
            };

            // Si le message est trop long pour afficher en 1seul message, le couper en 2
            if (sms.content[0].length >= 1900) {
                sms.content[1] = sms.content[0].substring(1900);
                sms.content[0] = sms.content[0].substring(0, 1900);
            }

            // Envoi du message à l'expéditeur
            sms.sender.send(`SMS de **vous** à **${sms.receivers.map(v => v.username).join(", ")}**: ${sms.content[0]}`);
            if (sms.content[1]) user.send(sms.content[1]);

            // Envoi du message à tous les destinataires
            /** @type {Promise<Discord.Message<false>>[]} */
            let messages_sent = [];
            for (const user of sms.receivers) {
                messages_sent.push(user.send(`SMS de ${sms.sender} à **vous**: ${sms.content[0]}`));
                if (sms.content[1]) messages_sent.push(user.send(sms.content[1]));
            }

            Promise.allSettled(messages_sent)
                .then((val) => {
                    if (val.every(v => v.status == "fulfilled")) {
                        modal_sub.reply({
                            embeds: [{
                                title: `✅ Tous les messages ont étés envoyés.`,
                                color: Discord.Colors.Green,
                            }],
                            ephemeral: true,
                        }).catch(console.error);
                    } else {
                        let messages_received = val.filter(v => v.status == "fulfilled");
                        let receiver_status = sms.receivers.map(u => {
                            return {
                                name: u.username,
                                value: 
                                    messages_received.some(v => v && v?.value?.channelId == u?.dmChannel?.id)
                                    ? `✅ Reçu`
                                    : `❌ Pas Reçu`,
                            }
                        });

                        modal_sub.reply({
                            embeds: [{
                                title: `❌ Un ou plusieurs messages n'ont pas étés envoyés.`,
                                description: `Si vous lisez ceci merci d'informer les MJ.\nReçus: ${messages_received.length} / Envoyés: ${messages_sent.length}\nSMS_SEND_ERROR`,
                                fields: receiver_status,
                                color: Discord.Colors.Red,
                            }],
                            ephemeral: true,
                        }).catch(console.error);

                        console.error(`[COMMAND SMS] SMS_SEND_ERROR: Received: ${messages_received.length} / Sent: ${messages_sent.length}`);
                    }

                    /**
                     * @param chn {Discord.TextChannel}
                    */
                    modal_sub.guild.channels.fetch("1082259250404937728").then((chn) => {
                        chn.send(`SMS de ${sms.sender} à ${destinataire}: ${sms.content[0]}`).catch(console.error);
                        if (sms.content[1]) chn.send(sms.content[1]).catch(console.error);
                    })
                    .catch(console.error);
                }).catch(console.error);
        })
        .catch(console.error);
}