import dotenv from 'dotenv';
import path from 'path';
import { getGlobals } from 'common-es';
import { GoogleGenAI } from '@google/genai';
import {
    BOT_AVATAR,
    BOT_NAME,
    GRAY_RAVEN_BOT_AVATAR,
    GRAY_RAVEN_URL,
    USER_AGENT,
} from '@utils/constants.js';
import axios from 'axios';
import { KuroNotiModel } from '@models/kuro-noti.model.js';
import { Client } from 'discord.js';
import dayjs from 'dayjs';

const { __dirname } = getGlobals(import.meta.url);
dotenv.config({ path: path.join(__dirname, '../.env') });

class GrayRaven {
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
        const response = await axios.get(GRAY_RAVEN_URL, {
            headers: {
                'User-Agent': USER_AGENT,
            },
        });

        const html = response.data;
        const aiResponse = await this.googleGenAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Extract the non expired Punishing Gray Raven codes from the following HTML content:\n\n${html}\n\nReturn the codes in a string, separated by commas.`,
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
            $and: [{ code: { $not: { $in: codes } } }, { game: 'pgr' }],
        });

        await Promise.all(
            noti.map(async (item) => {
                const user = await client.users.fetch(item.discordID);
                if (!user) {
                    console.warn(
                        `User with ID ${item.discordID} not found, skipping notification.`,
                    );
                    return;
                }

                await user.send({
                    embeds: [
                        {
                            title: 'New Punishing: Gray Raven Codes',
                            color: 0xeb86c6,
                            author: {
                                name: 'Punishing: Gray Raven',
                                icon_url: GRAY_RAVEN_BOT_AVATAR,
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
                                text: `${BOT_NAME} - Punishing: Gray Raven Codes`,
                                icon_url: BOT_AVATAR,
                            },
                        },
                    ],
                });

                item.notifiedCodes.push(...codes);
                await item.save();
            }),
        );
    }
}

export default new GrayRaven();
