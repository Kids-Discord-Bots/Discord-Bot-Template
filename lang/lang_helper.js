// ===============================
// This file provides different useful methods about languages
// ===============================

const { default_lang, enable_lang_change, lang_paths } = require("../config/config.json")
const db_helper = require("../db/db_helper")
const { logger } = require("../js/helper")

// get all language files and save it into text
const text = {}
for (const lang in lang_paths) {
    text[lang] = require(`./${lang_paths[lang]}`)
}


// checks if the given lang has a lang_file (is supported)
function is_valid(lang) {
    return text.hasOwnProperty(lang)
}

// returns text in the correct language (scope = path to parent json object (e.g. commands.help); key = json key in scope (e.g. help))
async function get_text(message, key, scope) {
    const lang = (enable_lang_change) ? await db_helper.get_lang(message) : default_lang
    const scope_arr = scope.split(".")
    scope_arr.push(key)

    let scope_text = text[lang]
    for (const element of scope_arr) {
        if (scope_text.hasOwnProperty(element)) {
            scope_text = scope_text[element]

        } else {
            logger.log('error', `Text-Key ${key} dont exist for the scope ${scope} and lang ${lang}!`)
            return "??"
        }
    }

    return scope_text
}

module.exports = { text, is_valid, get_text }
