import mongoose from 'mongoose';
import { HoyoCookieModel } from '@models/hoyo-cookie.model.js';
import { HoyoRedeemModel } from '@models/hoyo-redeem.model.js';
import { KuroNotiModel } from '@models/kuro-noti.model.js';
import {
    BOT_AVATAR,
    BOT_NAME,
    CRON_CHECKIN,
    CRON_REDEEM,
    CRON_REFRESH_HOYO_TOKEN,
} from '@utils/constants.js';
import { Client } from 'discord.js';
import { loadEnv } from '@utils/fn.js';
import { CronJob } from 'cron';
import hoyolab from '@modules/hoyolab/hoyolab.js';
import wutheringWaves from '@modules/kuro/wuthering-waves.js';
import grayRaven from '@modules/kuro/gray-raven.js';

loadEnv();

const main = async () => {
    try {
        // DB initialization
        const mongoUri = process.env.DB_URL;
        if (!mongoUri) {
            console.error('DB_URL is not defined in the environment variables');
            return;
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB successfully');

        await Promise.all([HoyoCookieModel.init(), HoyoRedeemModel.init(), KuroNotiModel.init()]);
        console.log('Models initialized successfully');
        // End DB initialization

        // Discord client initialization
        const discordToken = process.env.BOT_TOKEN;
        if (!discordToken) {
            console.error('BOT_TOKEN is not defined in the environment variables');
            return;
        }

        const client = new Client({
            intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMembers'],
        });

        await client.user?.setAvatar(BOT_AVATAR);
        await client.user?.setUsername(BOT_NAME);

        client.once('ready', () => {
            console.log(`Logged in as ${client.user?.tag}`);
        });
        client.login(discordToken);
        // End Discord client initialization

        //Start cron jobs
        new CronJob(
            CRON_CHECKIN,
            async () => {
                await hoyolab.signIn(client);
            },
            null,
            true,
            'Asia/Ho_Chi_Minh',
        );

        new CronJob(
            CRON_REDEEM,
            async () => {
                await hoyolab.redeemCode(client);
            },
            null,
            true,
            'Asia/Ho_Chi_Minh',
        );

        new CronJob(
            CRON_REFRESH_HOYO_TOKEN,
            async () => {
                await hoyolab.refreshCookie(client);
                await wutheringWaves.checkCode(client);
                await grayRaven.checkCode(client);
            },
            null,
            true,
            'Asia/Ho_Chi_Minh',
        );
        // End cron jobs
    } catch (error) {
        console.error('Error:', error);
    }
};

main();
