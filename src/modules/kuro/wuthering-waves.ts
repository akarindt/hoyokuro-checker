import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
    BOT_AVATAR,
    BOT_NAME,
    USER_AGENT,
    WUWA_BOT_AVATAR,
    WUWA_URL,
} from '@utils/constants.js';
import axios from 'axios';
import { getGlobals } from 'common-es';
import path from 'path';
import { KuroNotiModel } from '@models/kuro-noti.model.js';
import { Client } from 'discord.js';
import dayjs from 'dayjs';

const { __dirname } = getGlobals(import.meta.url);
dotenv.config({ path: path.join(__dirname, '../../../.env') });

class WutheringWaves {
    private googleGenAI: GoogleGenAI;

    constructor() {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            throw new Error(
                'GOOGLE_AI_API_KEY is not defined in the environment variables',
            );
        }

        this.googleGenAI = new GoogleGenAI({
            apiKey: apiKey,
        });
    }

    public async getCodes() {
        const response = await axios.get(WUWA_URL, {
            headers: {
                'User-Agent': USER_AGENT,
            },
        });

        const html = response.data;
        const aiResponse = await this.googleGenAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Extract the non expired codes from the following HTML content:\n\n${html}\n\nReturn the codes in a string, separated by commas.`,
        });

        return (aiResponse.text || '')
            .trim()
            .split(',')
            .map((code) => code.trim())
            .filter((code) => code.length > 0);
    }

    public async checkCode(client: Client) {
        const codes = await this.getCodes();
        const noti = await KuroNotiModel.find({
            $and: [{ code: { $not: { $in: codes } } }, { game: 'wuwa' }],
        });

        await Promise.all(
            noti.map(async (notiItem) => {
                const user = await client.users.fetch(notiItem.discordID);
                if (!user) {
                    console.warn(
                        `User with ID ${notiItem.discordID} not found, skipping notification.`,
                    );
                    return;
                }

                await user.send({
                    embeds: [
                        {
                            title: 'New Wuthering Waves Codes',
                            color: 0xeb86c6,
                            author: {
                                name: 'Wuthering Waves',
                                icon_url: WUWA_BOT_AVATAR,
                            },
                            fields: [
                                {
                                    name: 'New Codes',
                                    value: codes.join('\n\r'),
                                    inline: false,
                                },
                            ],
                            timestamp: dayjs().toISOString(),
                            footer: {
                                text: `${BOT_NAME} - Wuthering Waves Codes`,
                                icon_url: BOT_AVATAR,
                            },
                        },
                    ],
                });

                notiItem.notifiedCodes.push(...codes);
                await notiItem.save();
            }),
        );
    }
}

export default new WutheringWaves();
