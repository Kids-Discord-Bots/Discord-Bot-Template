// ===============================
// This is the entry point of the whole program!
// This file will collect every needed package or code file together and start the discord bot.
// In this file is also the event listener for every incoming message for the bot.
// This file checks, if the message is a valid command and if so, it will execute.
// ===============================


// ---------------------------------
// Preparations
// ---------------------------------
// require needed modules.
const fs = require('fs')
const Discord = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// create client with its intents
const client = new Discord.Client({ intents: [
        Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING, Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
        Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
        partials: ['CHANNEL']})

// get required methods and fields and save it into client. This will always be accessible with message.client
client.commands = new Discord.Collection()
client.config = require('./config/config.json')
client.helper = require('./js/helper_functions')
client.lang_helper = require("./lang/lang_helper")
client.db_helper = require('./db/db_helper')
client.DB = require('./db/db_init').DB
client.sequelize = require('./db/db_init').sequelize
client.logger = require("./js/logger").logger
client.command_event = require("./js/event_helper/command_event")
client.menu_event = require("./js/event_helper/menu_event")
client.button_event = require("./js/event_helper/button_event")

// helper fields
const commands_path = "./commands"

// dynamically retrieve all command files and additionally save it into message.client.command_tree
let command_tree = {}
const commandFolders = fs.readdirSync(commands_path)
for (const folder of commandFolders) {
    command_tree[folder] = {}
    const commandFiles = fs.readdirSync(`${commands_path}/${folder}`).filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        const command = require(`${commands_path}/${folder}/${file}`)
        if (command.hasOwnProperty("disabled") && command.disabled) continue
        client.commands.set(command.name, command)
        command_tree[folder][command.name] = command
    }
}
client.command_tree = command_tree
// ---------------------------------



// ---------------------------------
// Event-Handler
// ---------------------------------
// when the client is ready (bot is ready)
client.once('ready', async () => {
    // set activity
    if (client.config.enable_activity) {
        await client.user.setActivity(client.config.activity.name, { type: client.config.activity.type })
    }

    // sync database
    await client.sequelize.sync()

    // log ready info
    client.logger.log('info', 'Ready!')
});

// react on messages
client.on('messageCreate',
    async msg => await client.command_event.message_create(msg))

// when a discord-menu was chosen
client.on("interactionCreate",
    async (interaction) => await client.menu_event.interaction_create(interaction))

// when a discord-button was pressed
client.on("interactionCreate",
    async (interaction) => await client.button_event.interaction_create(interaction))
// ---------------------------------

// login to Discord with app's token
client.login(client.config.token)
