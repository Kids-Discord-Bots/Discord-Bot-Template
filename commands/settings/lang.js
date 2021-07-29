// ===============================
// The lang command is only usable, if 'enable_lang_change' in config is true (see disabled: !enable_lang_change)
// If lang is called without arguments, the command shows the current used language of the author from message.
// If lang is called with a valid language as language (see config), it will change the for the author from message to it
// ===============================

const db_helper = require("../../db/db_helper.js")
const { get_text: gt, is_valid: iv } = require("../../lang/lang_helper")
const { enable_lang_change, lang_paths } = require("../../config/config.json")
const s = "commands.lang."

module.exports = {
    name: 'lang',
    description: async function (msg) { return `${(await gt(msg, s + "help"))} ${Object.keys(lang_paths).join(", ")}` },
    aliases: ['change_lang', 'language', 'cl'],
    args_needed: false,
    args_min_length: 0,
    usage: async function (msg) { return await gt(msg, s + "usage") },
    disabled: !enable_lang_change,
    async execute(msg, args) {
        if (args.length > 0) {
            if (iv(args[0])) {
                if (await db_helper.set_lang(msg, args[0])) {
                    msg.channel.send(`${await gt(msg, `${s}set`)} ${args[0]}`)

                } else {
                    msg.reply(`${await gt(msg, `${s}error`)} (${msg.author.username})!`)
                }

            } else {
                return msg.reply(await gt(msg, s + "invalid"))
            }

        } else {
            return msg.channel.send(`${await gt(msg, s + "get")} ${await db_helper.get_lang(msg)}`)
        }
    },
};
