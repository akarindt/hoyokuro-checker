import mongoose, { ObjectId } from 'mongoose';

const Schema = mongoose.Schema;

export type HoyoRedeem = {
    _id: ObjectId;
    discordID: string;
    hoyoCookieID: ObjectId;
    code: string;
    type: 'zenless' | 'starrail' | 'genshin';
    createdAt: Date;
    updatedAt: Date;
};

const HoyoRedeemSchema = new Schema<HoyoRedeem>(
    {
        discordID: {
            type: String,
            required: true,
            index: true,
        },
        hoyoCookieID: {
            type: Schema.Types.ObjectId,
            ref: 'HoyoCookie',
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['zenless', 'starrail', 'genshin'],
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export const HoyoRedeemModel = mongoose.model<HoyoRedeem>('HoyoRedeem', HoyoRedeemSchema);
