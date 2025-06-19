import dotenv from 'dotenv';
import { getGlobals } from 'common-es';
import path from 'path';
import fs from 'fs';

type ParseCookieOption = {
    whitelist: string[];
    blacklist: string[];
    separator: string;
};

export const loadEnv = () => {
    const { __dirname } = getGlobals(import.meta.url);
    const pathToEnv = path.join(__dirname, '../../.env');
    if (!fs.existsSync(pathToEnv)) {
        console.warn(`.env file not found at ${pathToEnv}. Using default environment variables.`);
        return;
    }

    dotenv.config({ path: pathToEnv });
};

export const parseCookie = (cookie: string, options: ParseCookieOption) => {
    const { whitelist = [], blacklist = [], separator = ';' } = options;

    const cookiesArray = cookie.split(separator).map((c) => c.trim());
    const cookieMap = Object.fromEntries(
        cookiesArray.map((c) => {
            const [key, value] = c.split('=');
            return [key, value];
        }),
    );

    if (whitelist.length !== 0) {
        const filteredCookiesArray = Object.keys(cookieMap)
            .filter((key) => whitelist.includes(key))
            .map((key) => `${key}=${cookieMap[key]}`);

        return filteredCookiesArray.join(`${separator} `);
    }
    if (blacklist.length !== 0) {
        const filteredCookiesArray = Object.keys(cookieMap)
            .filter((key) => !blacklist.includes(key))
            .map((key) => `${key}=${cookieMap[key]}`);

        return filteredCookiesArray.join(`${separator} `);
    }

    return cookie;
};
