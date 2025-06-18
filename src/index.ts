import mongoose from 'mongoose';
import { HoyoCookieModel } from '@models/hoyo-cookie.model.js';
import { HoyoRedeemModel } from '@models/hoyo-redeem.model.js';
import { KuroNotiModel } from '@models/kuro-noti.model.js';
import { BOT_AVATAR, BOT_NAME } from '@utils/constants.js';
import { Client } from 'discord.js';
import { getGlobals } from 'common-es';
import dotenv from 'dotenv';
import path from 'path';

const { __dirname } = getGlobals(import.meta.url);
dotenv.config({ path: path.join(__dirname, '../.env') });

(async () => {
    try {
        // DB initialization
        const mongoUri = process.env.DB_URL;
        if (!mongoUri) {
            console.error('DB_URL is not defined in the environment variables');
            return;
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB successfully');

        await Promise.all([
            HoyoCookieModel.init(),
            HoyoRedeemModel.init(),
            KuroNotiModel.init(),
        ]);
        console.log('Models initialized successfully');
        // End DB initialization

        // Discord client initialization
        const discordToken = process.env.BOT_TOKEN;
        if (!discordToken) {
            console.error(
                'BOT_TOKEN is not defined in the environment variables',
            );
            return;
        }

        const client = new Client({
            intents: [
                'Guilds',
                'GuildMessages',
                'MessageContent',
                'GuildMembers',
            ],
        });

        await client.user?.setAvatar(BOT_AVATAR);
        await client.user?.setUsername(BOT_NAME);

        client.once('ready', () => {
            console.log(`Logged in as ${client.user?.tag}`);
        });
        client.login(discordToken);
        // End Discord client initialization
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
})();
