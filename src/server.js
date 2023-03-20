const Discord = require("discord.js");
const Canvas = require("@napi-rs/canvas");
const fs = require("node:fs");
const { google } = require("googleapis");

const config = require(`${__dirname}/config.json`);
const commandsManager = require(`${__dirname}/commands/manager.js`);
const utils = require(`${__dirname}/utils.js`);

const bot = new Discord.Client({
    intents: ["Guilds", "GuildMembers", "DirectMessages", "GuildWebhooks", "GuildVoiceStates"],
    presence: {
        status: "online",
        afk: false,
        activities: [
            { name: "le rp", type: Discord.ActivityType.Watching },
        ],
    },
});
bot.login(config.bot_token);
bot.on(Discord.Events.ClientReady, async () => {
    console.log(`[DISCORD] Client Ready.`);
});

const gauth = new google.auth.GoogleAuth({
    keyFile: `${__dirname}/gapi_auth.json`
});

// Commandes
bot.on(Discord.Events.InteractionCreate, async (interaction) => {
    let gauth_client = await gauth.getClient();

    if (interaction.isCommand())
        commandsManager(interaction, { config, utils, gauth_client });
});


// Météo
const weather_summer = {
    icon: `☀`,
    temp_min: 20,
    temp: 30,
    temp_max: 40,
    wind_min: 0,
    wind: 20,
    wind_max: 100,
    moist_min: 20,
    moist: 35,
    moist_max: 70,
    coef_min: 80,
    coef: 110,
    coef_max: 120,
};
const weather_autumn = {
    icon: `🍂`,
    temp_min: 0,
    temp: 12,
    temp_max: 20,
    wind_min: 10,
    wind: 50,
    wind_max: 120,
    moist_min: 50,
    moist: 65,
    moist_max: 80,
    coef_min: 40,
    coef: 70,
    coef_max: 90,
};
const weather_winter = {
    icon: `❄`,
    temp_min: -10,
    temp: 0,
    temp_max: 10,
    wind_min: 20,
    wind: 60,
    wind_max: 160,
    moist_min: 60,
    moist: 75,
    moist_max: 90,
    coef_min: 70,
    coef: 100,
    coef_max: 120,
};
const weather_bloom = {
    icon: `🌺`,
    temp_min: 16,
    temp: 25,
    temp_max: 38,
    wind_min: 0,
    wind: 20,
    wind_max: 70,
    moist_min: 30,
    moist: 40,
    moist_max: 60,
    coef_min: 20,
    coef: 60,
    coef_max: 80,
};

let weather = {
    temp: null,
    wind: null,
    moist: null,
    coef: null,
};
setInterval(() => {
    let date = new Date();

    let season;
    switch (date.getUTCMonth()) {
        case 11:
        case 0:
        case 1:
            // Hiver
            season = weather_winter;
            break;
        case 2:
        case 3:
        case 4:
            // Printemps
            season = weather_bloom;
            break;
        case 5:
        case 6:
        case 7:
            // Eté
            season = weather_summer;
            break;
        case 8:
        case 9:
        case 10:
            // Automne
            season = weather_autumn;
            break;

        default:
            season = weather_summer;
            break;
    }

    // Default values
    if (weather.temp == null)
        weather.temp = season.temp;
    if (weather.wind == null)
        weather.wind = season.wind;
    if (weather.moist == null)
        weather.moist = season.moist;
    if (weather.coef == null)
        weather.coef = season.coef;

    // TODO: Implement variations
    // Variations
    weather.temp += utils.falloffCurve(
        Math.random(),
        utils.lerp(0, 100, (weather.temp - season.temp) / (season.temp_max-season.temp))
    );
    weather.temp -= utils.falloffCurve(
        Math.random(),
        utils.lerp(100, 0, weather.temp / (season.temp_min + season.temp)) 
    );
    weather.wind += utils.falloffCurve(
        Math.random(),
        utils.lerp(0, 100, (weather.wind - season.wind) / (season.wind_max-season.wind))
    );
    weather.wind -= utils.falloffCurve(
        Math.random(),
        utils.lerp(100, 0, weather.wind / (season.wind_min + season.wind)) 
    );
    weather.moist += utils.falloffCurve(
        Math.random(),
        utils.lerp(0, 100, (weather.moist - season.moist) / (season.moist_max-season.moist))
    );
    weather.moist -= utils.falloffCurve(
        Math.random(),
        utils.lerp(100, 0, weather.moist / (season.moist_min + season.moist)) 
    );
    weather.coef += utils.falloffCurve(
        Math.random(),
        utils.lerp(0, 100, (weather.coef - season.coef) / (season.coef_max-season.coef))
    );
    weather.coef -= utils.falloffCurve(
        Math.random(),
        utils.lerp(100, 0, weather.coef / (season.coef_min + season.coef)) 
    );

    // Send msg at midnight
    if (date.getUTCHours() == 0 && date.getUTCMinutes() == 0) {
        bot.guilds.fetch("1075350024919195658").then(guild => {
            guild.channels.fetch("1081125060808556544").then(chn => {
                chn.send({
                    embeds: [{
                        title: `${season.icon} Bulletin Météo:`,
                        description: `🌡 Température: ${weather.temp.toFixed(1)}°C\n🍃 Vent: ${weather.wind.toFixed(0)}km/h\n💦 Humidité: ${weather.moist.toFixed(0)}%\n🌊 Coef Maritime: ${weather.coef.toFixed(0)}`,
                        color: Discord.Colors.Aqua,
                    }],
                }).catch(console.error);
            }).catch(console.error);
        }).catch(console.error);
    }
}, 60000);