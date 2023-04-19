/**
*  Copyright 2021 BrylanBristopherNFTs
*  This source file is subject to the terms and conditions of
*  THE FREE AS IN EGGCRYPT / OPEN AS IN OPENAI (FAIE/OAIO) LICENSE.
*  You may not use this file except in compliance with the License.
*/

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');
const { inject } = require('powercord/injector');

const SALTLEN = 8;
const BLOCKLEN = 16;
const DERIVEROUNDS = 50000;

// @generated
// t=off
const CN1_T_L = { "一": 0, "丁": 1, "丂": 2, "七": 3, "丄": 4, "丅": 5, "丆": 6, "万": 7, "丈": 8, "三": 9, "上": 10, "下": 11, "丌": 12, "不": 13, "与": 14, "丏": 15, "丐": 16, "丑": 17, "丒": 18, "专": 19, "且": 20, "丕": 21, "世": 22, "丗": 23, "丘": 24, "丙": 25, "业": 26, "丛": 27, "东": 28, "丝": 29, "丞": 30, "丟": 31, "丠": 32, "両": 33, "丢": 34, "丣": 35, "两": 36, "严": 37, "並": 38, "丧": 39, "丨": 40, "丩": 41, "个": 42, "丫": 43, "丬": 44, "中": 45, "丮": 46, "丯": 47, "丰": 48, "丱": 49, "串": 50, "丳": 51, "临": 52, "丵": 53, "丶": 54, "丷": 55, "丸": 56, "丹": 57, "为": 58, "主": 59, "丼": 60, "丽": 61, "举": 62, "丿": 63, "乀": 64, "乁": 65, "乂": 66, "乃": 67, "乄": 68, "久": 69, "乆": 70, "乇": 71, "么": 72, "义": 73, "乊": 74, "之": 75, "乌": 76, "乍": 77, "乎": 78, "乏": 79, "乐": 80, "乑": 81, "乒": 82, "乓": 83, "乔": 84, "乕": 85, "乖": 86, "乗": 87, "乘": 88, "乙": 89, "乚": 90, "乛": 91, "乜": 92, "九": 93, "乞": 94, "也": 95, "习": 96, "乡": 97, "乢": 98, "乣": 99, "乤": 100, "乥": 101, "书": 102, "乧": 103, "乨": 104, "乩": 105, "乪": 106, "乫": 107, "乬": 108, "乭": 109, "乮": 110, "乯": 111, "买": 112, "乱": 113, "乲": 114, "乳": 115, "乴": 116, "乵": 117, "乶": 118, "乷": 119, "乸": 120, "乹": 121, "乺": 122, "乻": 123, "乼": 124, "乽": 125, "乾": 126, "乿": 127, "亀": 128, "亁": 129, "亂": 130, "亃": 131, "亄": 132, "亅": 133, "了": 134, "亇": 135, "予": 136, "争": 137, "亊": 138, "事": 139, "二": 140, "亍": 141, "于": 142, "亏": 143, "亐": 144, "云": 145, "互": 146, "亓": 147, "五": 148, "井": 149, "亖": 150, "亗": 151, "亘": 152, "亙": 153, "亚": 154, "些": 155, "亜": 156, "亝": 157, "亞": 158, "亟": 159, "亠": 160, "亡": 161, "亢": 162, "亣": 163, "交": 164, "亥": 165, "亦": 166, "产": 167, "亨": 168, "亩": 169, "亪": 170, "享": 171, "京": 172, "亭": 173, "亮": 174, "亯": 175, "亰": 176, "亱": 177, "亲": 178, "亳": 179, "亴": 180, "亵": 181, "亶": 182, "亷": 183, "亸": 184, "亹": 185, "人": 186, "亻": 187, "亼": 188, "亽": 189, "亾": 190, "亿": 191, "什": 192, "仁": 193, "仂": 194, "仃": 195, "仄": 196, "仅": 197, "仆": 198, "仇": 199, "仈": 200, "仉": 201, "今": 202, "介": 203, "仌": 204, "仍": 205, "从": 206, "仏": 207, "仐": 208, "仑": 209, "仒": 210, "仓": 211, "仔": 212, "仕": 213, "他": 214, "仗": 215, "付": 216, "仙": 217, "仚": 218, "仛": 219, "仜": 220, "仝": 221, "仞": 222, "仟": 223, "仠": 224, "仡": 225, "仢": 226, "代": 227, "令": 228, "以": 229, "仦": 230, "仧": 231, "仨": 232, "仩": 233, "仪": 234, "仫": 235, "们": 236, "仭": 237, "仮": 238, "仯": 239, "仰": 240, "仱": 241, "仲": 242, "仳": 243, "仴": 244, "仵": 245, "件": 246, "价": 247, "仸": 248, "仹": 249, "仺": 250, "任": 251, "仼": 252, "份": 253, "仾": 254, "仿": 255 };
const CN1_T_C = Object.keys(CN1_T_L);
// t=on

const PROFILES_PATH = path.join(__dirname, "profiles.json");
const CUSTOM_STYLE_PATH = path.join(__dirname, "custom_style.css");

let _current_profile = null;
let _profiles = {};
let _textbox_listening = false;
module.exports = class Eggcrypt extends Plugin {
    async startPlugin() {
        document.addEventListener('animationstart', event => {
            if (event.animationName === '__ec__TextBoxInserted') {
                event.target.style.color = _current_profile ? _profiles[_current_profile].color : null;
            }
        }, false);


        if (!fs.existsSync(PROFILES_PATH)) {
            fs.writeFileSync(PROFILES_PATH, '{\n"pubdef": {\n"password": "0dc9820f1ab911688e9432c05c6b9dpublic",\n "color": "#f500f0"\n}\n}');
        }

        if (fs.existsSync(CUSTOM_STYLE_PATH)) {
            this.loadStylesheet(CUSTOM_STYLE_PATH);
        }

        let styles = document.createElement('style');
        styles.id = '__ec__chinaprstyles';
        document.head.appendChild(styles);
        this.reloadProfiles();
        this.registerCommands();

        let MessageActions = await getModule(['_sendMessage'], false);
        let MessageContent = await getModule(m => m.type && m.type.displayName === 'MessageContent', false);
        inject('eggcrypt-sendMessage', MessageActions, '_sendMessage', this.patch_sendMessage, true);
        inject('eggcrypt-msgcontent', MessageContent, 'type', this.patchMessageContent, true);
        inject('eggcrypt-aftermsgcontent', MessageContent, 'type', this.patchAfterMessageContent, false);
    }

    registerCommands() {
        powercord.api.commands.registerCommand({
            command: 'setecprofile',
            aliases: ['e', 'ec'],
            description: 'set the eggcrypt profile',
            usage: '[profile name]',
            showTyping: false,
            executor: this.setProfileCommand,
            autocomplete: args => {
                if (args.length !== 1) return false;
                return {
                    header: 'Profiles',
                    commands: ['disable', ...Object.keys(_profiles)]
                        .filter(n => n.toLowerCase().startsWith(args[0].toLowerCase()))
                        .map(k => ({
                            command: k
                        }))
                }
            }
        });
        powercord.api.commands.registerCommand({
            command: 'reloadecprofiles',
            aliases: ['ecr', 'reloadec'],
            description: 'reload the eggcrypt profiles from profiles.json',
            usage: '',
            showTyping: false,
            executor: this.reloadProfiles
        });
        powercord.api.commands.registerCommand({
            command: 'addprofile',
            aliases: ['ecadd'],
            description: 'add an eggcrypt profile',
            usage: '<name> <color> <password>',
            showTyping: false,
            executor: this.addProfile
        });
        powercord.api.commands.registerCommand({
            command: 'rmprofile',
            aliases: ['ecrm', 'delprofile', 'removeprofile'],
            description: 'remove an eggcrypt profile',
            usage: '<name>',
            showTyping: false,
            executor: this.removeProfile
        });
    }

    reloadProfiles() {
        _current_profile = null;
        let d = fs.readFileSync(PROFILES_PATH);
        _profiles = JSON.parse(d.toString());
        updateProfileStyles();
    }

    addProfile(args) {
        if (args.length != 3 || !args[0] || !args[1] || !args[2]) return { send: false, result: 'invalid args. usage: addprofile <name> <color> <password>' };

        if (/^[a-zA-Z0-9]+$/.test(args[0])) {
            _profiles[args[0]] = { color: args[1], password: args[2] };
            fs.writeFileSync(PROFILES_PATH, JSON.stringify(_profiles));
            updateProfileStyles();
            return { send: false, result: 'success' };
        } else {
            return { send: false, result: 'invalid profile name. must be a-zA-Z0-9' };
        }
    }

    removeProfile(args) {
        if (args.length === 0 || !Object.keys(_profiles).includes(args[0])) return { send: false, result: 'unknown profile' };
        delete _profiles[args[0]];
        fs.writeFileSync(PROFILES_PATH, JSON.stringify(_profiles));
        if (_current_profile === args[0]) _current_profile = null;
        updateProfileStyles();
        return { send: false, result: 'success' };
    }

    setProfileCommand(args) {
        let ret;

        if (args[0] === 'disable') {
            _current_profile = null;
            ret = { send: false, result: 'eggcryption disabled' };
        } else if (_profiles[args[0]]) {
            _current_profile = args[0];
            ret = { send: false, result: `profile set to ${args[0]}` };
        } else {
            ret = { send: false, result: 'unknown profile' };
        }

        if (!_textbox_listening) {
            let te = getModule(['channelTextArea', 'textArea'], false);
            let listener = document.createElement('style');
            listener.innerHTML = `@keyframes __ec__TextBoxInserted { from { outline: 1px solid transparent; } to { outline: 0px solid transparent; } }
            div.${te.textArea} > div:first-child { animation-duration: 0.001s !important; animation-name: __ec__TextBoxInserted !important; }`;
            document.head.appendChild(listener);
            _textbox_listening = true;
        }

        return ret;
    }

    patch_sendMessage(args) {
        if (_current_profile !== null) {
            args[1].content = encrypt(args[1].content);
        }

        return args;
    }

    patchMessageContent(args) {
        if (args[0] && args[0].content && typeof args[0].content[0] === 'string' && args[0].content[0].startsWith('侔俿')) {
            try {
                let result = decrypt(args[0].content[0]);
                if (result === null) return args;

                args[0].content[0] = result[0];
                args[0].message.content = args[0].content[0];
                args[0].message.author.system = true;
                args[0].message.__ECPROFILE__ = result[1];
            } catch (e) { console.error(e); }
        }

        return args;
    }

    patchAfterMessageContent(args, res) {
        if (args[0] && typeof args[0].message.__ECPROFILE__ === 'string') {
            res.props.className += ` __ec__chinamsgpr_${args[0].message.__ECPROFILE__}`;
        }
        return res;
    }
}

function deriveKey(password, salt) {
    return crypto.pbkdf2Sync(password, salt, DERIVEROUNDS, 16, 'sha256');
}

function encrypt(message) {
    let salt = crypto.randomBytes(SALTLEN);
    let iv = crypto.randomBytes(BLOCKLEN);
    let key = deriveKey(_profiles[_current_profile].password, salt);

    let cipher = crypto.createCipheriv('aes-128-cbc', key, iv, {});
    cipher.setAutoPadding(true);

    let ciphertext = cipher.update(message, 'utf8');
    let ciphertext_f = cipher.final();
    ciphertext = Buffer.concat([ciphertext, ciphertext_f], ciphertext.length + ciphertext_f.length);

    return [
        '侔',
        encodeChina(salt),
        encodeChina(iv),
        encodeChina(ciphertext)
    ].join('俿');
}

function decrypt(message) {
    let parts = message.split('俿');
    let salt, iv, ciphertext;

    try {
        salt = decodeChina(parts[1]);
        iv = decodeChina(parts[2]);
        ciphertext = decodeChina(parts[3]);
    } catch (e) { console.debug(e); return null; }


    for (const profile of Object.keys(_profiles)) {
        try {
            let key = deriveKey(_profiles[profile].password, salt);
            let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv, {});
            decipher.setAutoPadding(true);

            let plaintext = decipher.update(ciphertext, null, 'utf8');
            plaintext += decipher.final();
            return [plaintext, profile];
        } catch (e) { console.debug(e); }
    }
    return null;
}

function encodeChina(buffer) {
    let out = '';
    for (const byte of buffer) {
        out += CN1_T_C[byte];
    }
    return out;
}

function decodeChina(str) {
    let buffer = Buffer.alloc(str.length);
    for (let i = 0; i < str.length; i++) {
        buffer[i] = CN1_T_L[str[i]];
    }
    return buffer;
}

function updateProfileStyles() {
    let styles = document.getElementById('__ec__chinaprstyles');
    styles.innerHTML = '';
    for (const k in _profiles) {
        if (/^[a-zA-Z0-9]+$/.test(k)) {
            if (!_profiles[k].color) continue;
            styles.innerHTML += `.__ec__chinamsgpr_${k}{color:${_profiles[k].color};}`;
        } else {
            console.error(`[eggcrypt] invalid profile name '${k}'. profile names must ^[a-zA-Z0-9]+$`);
        }
    }
}