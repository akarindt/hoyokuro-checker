import { HoyoCookieModel } from '@models/hoyo-cookie.model.js';
import { HoyoRedeemModel } from '@models/hoyo-redeem.model.js';
import { HOYOVERSE_RECORD_CARD_API, USER_AGENT } from '@utils/constants.js';
import { parseCookie } from '@utils/fn.js';
import got from 'got';
import { Client } from 'discord.js';
import { setTimeout } from 'timers/promises';

type UpdateHoyolabCookieResponse = {
    code: number;
    data?: {
        cookie_info: {
            account_id: number;
            account_name: string;
            area_code: string;
            cookie_token: string;
            cur_time: number;
            email: string;
            mobile: string;
        };
        info: string;
        msg: string;
        sign: string;
        status: number;
    };
};

type HoyoverseCheckIn = {
    code: string;
    risk_code: number;
    gt: string;
    challenge: string;
    success: number;
    is_risk: boolean;
};

type HoyoverseApiResponse<T> = {
    retcode: number;
    message: string;
    data: T;
};

type HoyoverseAccountData = {
    list: {
        has_role: boolean;
        game_id: number;
        game_role_id: string;
        nickname: string;
        region: string;
        level: number;
        background_image: string;
        is_public: boolean;
        data: {
            name: string;
            type: number;
            value: string;
        }[];
        region_name: string;
        url: string;
        data_switches: {
            switch_id: number;
            is_public: boolean;
            switch_name: string;
        }[];
        h5_data_switches: unknown[];
        background_color: string;
        background_image_v2: string;
        logo: string;
        game_name: string;
    }[];
};

type HoyoverseCodeResponse = Record<string, Array<{ code: string; rewards: string[] }>>;

type HoyoverseConfig = {
    headers: Record<string, string>;
    addtionalHeaders: Record<string, string>;
    ACT_ID: string;
    success: string;
    signed: string;
    gameName: string;
    gameId: number;
    assets: {
        author: string;
        gameName: string;
        icon: string;
    };
    url: {
        info: string;
        home: string;
        sign: string;
        redem: string;
        checkCodeWeb: string;
    };
};

class HoyoLab {
    private hoyoverseConfig: Record<string, HoyoverseConfig>;

    constructor() {
        this.hoyoverseConfig = {
            zenless: {
                headers: {
                    'User-Agent': USER_AGENT,
                    'x-rpc-signgame': 'zzz',
                },
                addtionalHeaders: {
                    Host: 'public-operation-nap.hoyoverse.com',
                },
                ACT_ID: 'e202406031448091',
                success: 'Congratulations Proxy! You have successfully checked in today!~',
                signed: 'You have already checked in today, Proxy!~',
                gameName: 'Zenless Zone Zero',
                gameId: 8,
                assets: {
                    author: 'Eous',
                    gameName: 'Zenless Zone Zero',
                    icon: 'https://hyl-static-res-prod.hoyolab.com/communityweb/business/nap.png',
                },
                url: {
                    info: 'https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/info',
                    home: 'https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/home',
                    sign: 'https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign',
                    redem: 'https://public-operation-nap.hoyoverse.com/common/apicdkey/api/webExchangeCdkey',
                    checkCodeWeb: 'https://api.ennead.cc/mihoyo/zenless/codes',
                },
            },
            genshin: {
                headers: {
                    'User-Agent': USER_AGENT,
                },
                addtionalHeaders: {
                    Host: 'sg-hk4e-api.hoyoverse.com',
                },
                ACT_ID: 'e202102251931481',
                success: 'Congratulations, Traveler! You have successfully checked in today~',
                signed: "Traveler, you've already checked in today~",
                gameName: 'Genshin Impact',
                gameId: 2,
                assets: {
                    author: 'Paimon',
                    gameName: 'Genshin Impact',
                    icon: 'https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/12/b700cce2ac4c68a520b15cafa86a03f0_2812765778371293568.png',
                },
                url: {
                    info: 'https://sg-hk4e-api.hoyolab.com/event/sol/info',
                    home: 'https://sg-hk4e-api.hoyolab.com/event/sol/home',
                    sign: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign',
                    redem: 'https://sg-hk4e-api.hoyoverse.com/common/apicdkey/api/webExchangeCdkey',
                    checkCodeWeb: 'https://api.ennead.cc/mihoyo/genshin/codes',
                },
            },
            starrail: {
                headers: {
                    'User-Agent': USER_AGENT,
                },
                addtionalHeaders: {
                    Host: 'sg-hkrpg-api.hoyoverse.com',
                },
                ACT_ID: 'e202303301540311',
                success: 'You have successfully checked in today, Trailblazer~',
                signed: "You've already checked in today, Trailblazer~",
                gameName: 'Honkai: Star Rail',
                gameId: 6,
                assets: {
                    author: 'PomPom',
                    gameName: 'Honkai: Star Rail',
                    icon: 'https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/12/74330de1ee71ada37bbba7b72775c9d3_1883015313866544428.png',
                },
                url: {
                    info: 'https://sg-public-api.hoyolab.com/event/luna/os/info',
                    home: 'https://sg-public-api.hoyolab.com/event/luna/os/home',
                    sign: 'https://sg-public-api.hoyolab.com/event/luna/os/sign',
                    redem: 'https://sg-hkrpg-api.hoyoverse.com/common/apicdkey/api/webExchangeCdkeyRisk',
                    checkCodeWeb: 'https://api.ennead.cc/mihoyo/starrail/codes',
                },
            },
        };
    }

    public async getCodes(game: 'zenless' | 'genshin' | 'starrail') {
        const gameConfig = this.hoyoverseConfig[game];
        if (!gameConfig) {
            throw new Error(`Game configuration for ${game} not found.`);
        }
        const data = await got
            .get(gameConfig.url.checkCodeWeb, {
                headers: {
                    'User-Agent': USER_AGENT,
                },
            })
            .json<HoyoverseCodeResponse>();

        return data['active'];
    }

    public async signIn(client: Client) {
        const accounts = await HoyoCookieModel.find({}).lean();
        for (const account of accounts) {
            const cookie = account.cookie;
            const ltuid = cookie.match(/ltuid_v2=([^;]+)/);
            if (!ltuid) continue;

            let accountDetailData: HoyoverseApiResponse<HoyoverseAccountData>;
            try {
                accountDetailData = await got
                    .get(`${HOYOVERSE_RECORD_CARD_API}?uid=${ltuid[1]}`, {
                        headers: {
                            'User-Agent': USER_AGENT,
                            Cookie: cookie,
                        },
                    })
                    .json<HoyoverseApiResponse<HoyoverseAccountData>>();

                if (accountDetailData.retcode !== 0) {
                    console.warn(
                        `Failed to fetch account details for UID ${ltuid[1]}. API Message: ${accountDetailData.message}`,
                    );
                    continue;
                }

                const gameids = account.redeemOption.map((x) => ({
                    gameId: this.hoyoverseConfig[x].gameId,
                    name: x,
                }));

                const accountDetails = accountDetailData.data.list.filter((x) =>
                    gameids.map((y) => y.gameId).includes(x.game_id),
                );

                for (const detail of accountDetails) {
                    const gameName = gameids.find((x) => x.gameId === detail.game_id)?.name;
                    if (!gameName) continue;

                    const gameConfig = this.hoyoverseConfig[gameName];
                    if (!gameConfig) continue;

                    let signData: HoyoverseApiResponse<HoyoverseCheckIn>;
                    try {
                        signData = await got
                            .post(gameConfig.url.sign, {
                                json: {
                                    act_id: gameConfig.ACT_ID,
                                },
                                headers: {
                                    ...gameConfig.headers,
                                    Cookie: cookie,
                                },
                            })
                            .json<HoyoverseApiResponse<HoyoverseCheckIn>>();
                    } catch (error) {
                        console.warn(`Failed to sign in for ${detail.game_name}. Error: ${error}`);
                        continue;
                    }

                    if (signData.retcode !== 0) {
                        console.warn(
                            `Failed to sign in for ${detail.game_name}. API Message: ${signData.message}`,
                        );
                        continue;
                    }

                    const user = await client.users.fetch(account.discordID);
                    if (!user) {
                        console.warn(
                            `User with ID ${account.discordID} not found, skipping notification.`,
                        );
                        continue;
                    }

                    await user.send({
                        embeds: [
                            {
                                title: `Hoyoverse Sign In - ${gameConfig.gameName}`,
                                color: 0xeb86c6,
                                author: {
                                    name: gameConfig.assets.author,
                                    icon_url: gameConfig.assets.icon,
                                },
                                fields: [
                                    {
                                        name: 'Nickname',
                                        value: detail.nickname,
                                        inline: true,
                                    },
                                    {
                                        name: 'UID',
                                        value: detail.game_role_id,
                                        inline: true,
                                    },
                                    {
                                        name: 'Rank',
                                        value: detail.level.toString(),
                                        inline: true,
                                    },
                                    {
                                        name: 'Region',
                                        value: detail.region,
                                        inline: true,
                                    },
                                    {
                                        name: 'Result',
                                        value:
                                            signData.retcode === 0
                                                ? gameConfig.success
                                                : gameConfig.signed,
                                        inline: false,
                                    },
                                ],
                                timestamp: new Date().toISOString(),
                                footer: {
                                    text: `${gameConfig.assets.gameName} - Hoyoverse Sign In`,
                                    icon_url: gameConfig.assets.icon,
                                },
                            },
                        ],
                    });
                }
            } catch (error) {
                console.warn(
                    `Failed to fetch account details for UID ${ltuid[1]}. Error: ${error}`,
                );
                continue;
            }
        }
    }

    public async redeemCode(client: Client) {
        const accounts = await HoyoCookieModel.find({}).lean();
        for (const account of accounts) {
            const cookie = account.cookie;
            const ltuid = cookie.match(/ltuid_v2=([^;]+)/);
            if (!ltuid) continue;

            const gameids = account.redeemOption.map((x) => ({
                gameId: this.hoyoverseConfig[x].gameId,
                name: x,
            }));

            let accountDetailData: HoyoverseApiResponse<HoyoverseAccountData>;
            try {
                accountDetailData = await got
                    .get(`${HOYOVERSE_RECORD_CARD_API}?uid=${ltuid[1]}`, {
                        headers: {
                            'User-Agent': USER_AGENT,
                            Cookie: cookie,
                        },
                    })
                    .json<HoyoverseApiResponse<HoyoverseAccountData>>();
            } catch (error) {
                console.warn(
                    `Failed to fetch account details for UID ${ltuid[1]}. Error: ${error}`,
                );
                continue;
            }

            await setTimeout(5000);

            if (accountDetailData.retcode !== 0) {
                console.warn(
                    `Failed to fetch account details for UID ${ltuid[1]}. API Message: ${accountDetailData.message}`,
                );
                continue;
            }

            const accountDetails = accountDetailData.data.list.filter((x) =>
                gameids.map((y) => y.gameId).includes(x.game_id),
            );

            for (const detail of accountDetails) {
                const gameName = gameids.find((x) => x.gameId === detail.game_id)?.name;
                if (!gameName) continue;

                const gameConfig = this.hoyoverseConfig[gameName];
                if (!gameConfig) continue;

                const claimedCode = (
                    await HoyoRedeemModel.find({
                        $and: [{ type: gameName }, { hoyoCookieID: account._id }],
                    }).lean()
                ).map((x) => x.code);

                const fetchedCodes = (await this.getCodes(gameName)).filter(
                    (x) => !claimedCode.includes(x.code),
                );

                if (fetchedCodes.length === 0) {
                    console.log(
                        `No new codes available for ${gameName} for account ${account._id}`,
                    );
                    continue;
                }

                for (const code of fetchedCodes) {
                    try {
                        const cookieData = parseCookie(account.cookie, {
                            whitelist: [
                                'cookie_token_v2',
                                'account_mid_v2',
                                'account_id_v2',
                                'cookie_token',
                                'account_id',
                            ],
                            blacklist: [],
                            separator: ';',
                        });

                        let endp = gameConfig.url.redem;
                        switch (gameName) {
                            case 'genshin':
                                endp += `?uid=${detail.game_role_id}`;
                                endp += `&region=${detail.region}`;
                                endp += `&lang=en`;
                                endp += `&cdkey=${code.code}`;
                                endp += `&game_biz=hk4e_global`;
                                endp += `&sLangKey=en-us`;
                                break;
                            case 'zenless':
                                endp += `?t=${Date.now()}`;
                                endp += `&lang=en`;
                                endp += `&game_biz=nap_global`;
                                endp += `&uid=${detail.game_role_id}`;
                                endp += `&region=${detail.region}`;
                                endp += `&cdkey=${code.code}`;
                                break;
                            case 'starrail':
                                break;
                        }

                        const isPost = gameName === 'starrail';
                        const responseData = await got(endp, {
                            method: isPost ? 'POST' : 'GET',
                            headers: {
                                ...gameConfig.headers,
                                ...gameConfig.addtionalHeaders,
                                Cookie: cookieData,
                                scheme: 'https',
                            },
                            json: isPost
                                ? {
                                      cdkey: code.code,
                                      game_biz: 'hkrpg_global',
                                      lang: 'en',
                                      region: detail.region,
                                      t: Date.now(),
                                      uid: detail.game_role_id,
                                  }
                                : undefined,
                        }).json<HoyoverseApiResponse<unknown>>();

                        await setTimeout(5000);

                        if (responseData.retcode !== 0) {
                            await HoyoRedeemModel.create({
                                discordID: account.discordID,
                                hoyoCookieID: account._id,
                                code: code.code,
                                type: gameName,
                            });
                            console.log(
                                `[ERROR] ${gameName}: API returned non-0 retcode: ${responseData.message}`,
                            );
                            continue;
                        }

                        const user = await client.users.fetch(account.discordID);
                        if (!user) {
                            console.warn(
                                `User with ID ${account.discordID} not found, skipping notification.`,
                            );
                            return null;
                        }

                        await user.send({
                            embeds: [
                                {
                                    title: `Hoyoverse redeem code - ${gameConfig.gameName}`,
                                    color: 0xeb86c6,
                                    author: {
                                        name: gameConfig.assets.author,
                                        icon_url: gameConfig.assets.icon,
                                    },
                                    fields: [
                                        {
                                            name: 'Nickname',
                                            value: detail.nickname,
                                            inline: true,
                                        },
                                        {
                                            name: 'UID',
                                            value: detail.game_role_id,
                                            inline: true,
                                        },
                                        {
                                            name: 'Rank',
                                            value: detail.level.toString(),
                                            inline: true,
                                        },
                                        {
                                            name: 'Region',
                                            value: detail.region,
                                            inline: true,
                                        },
                                        {
                                            name: 'Code',
                                            value: `${code.code} - ${code.rewards.join(', ')}`,
                                            inline: false,
                                        },
                                    ],
                                    timestamp: new Date().toISOString(),
                                    footer: {
                                        text: `${gameConfig.assets.gameName} - Hoyoverse Sign In`,
                                        icon_url: gameConfig.assets.icon,
                                    },
                                },
                            ],
                        });

                        await HoyoRedeemModel.create({
                            discordID: account.discordID,
                            hoyoCookieID: account._id,
                            code: code.code,
                            type: gameName,
                        });
                        await setTimeout(5000);
                        console.log(`[SUCCESS] Code redeemed for ${gameName}: ${code.code}`);
                    } catch (error) {
                        console.log(`[ERROR] Code redemption error for ${gameName}: ${error}`);
                        await HoyoRedeemModel.create({
                            discordID: account.discordID,
                            hoyoCookieID: account._id,
                            code: code.code,
                            type: gameName,
                        });
                        await setTimeout(5000);
                    }
                }
            }
        }
    }

    public async refreshCookie(client: Client) {
        const accounts = await HoyoCookieModel.find({});

        for (const account of accounts) {
            const response = await got.get(
                'https://webapi-os.account.hoyoverse.com/Api/fetch_cookie_accountinfo',
                {
                    headers: {
                        Cookie: account.cookie,
                        'User-Agent': USER_AGENT,
                    },
                    responseType: 'json',
                    throwHttpErrors: false, // Để không ném lỗi khi mã HTTP không phải 2xx
                },
            );

            if (response.statusCode !== 200) {
                await client.users.send(
                    account.discordID,
                    `❌ Fetch cookie info failed! at index: #${account.id}`,
                );
                continue;
            }

            const responseData = response.body as UpdateHoyolabCookieResponse;
            const { data } = responseData;

            if (!data || data.status !== 1 || !data.cookie_info) {
                await client.users.send(
                    account.discordID,
                    `❌ Refresh token failed! at index: #${account.id}`,
                );
                continue;
            }

            const cookieData = parseCookie(account.cookie, {
                blacklist: ['cookie_token', 'account_id'],
                whitelist: [],
                separator: ';',
            });

            const accountId = data.cookie_info.account_id;
            const token = data.cookie_info.cookie_token;

            account.cookie = `cookie_token=${token}; account_id=${accountId}; ${cookieData}`;
            await account.save();
        }
        console.log('All cookies have been refreshed successfully!');
    }
}

export default new HoyoLab();
