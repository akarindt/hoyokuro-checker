import mongoose, { ObjectId } from 'mongoose';

const Schema = mongoose.Schema;

export type HoyoCookie = {
    _id: ObjectId;
    cookie: string;
    discordID: string;
    redeemOption: ('zenless' | 'genshin' | 'starrail')[];
    createdAt: Date;
    updatedAt: Date;
};

const HoyoCookieSchema = new Schema<HoyoCookie>(
    {
        cookie: {
            type: String,
            required: true,
        },
        discordID: {
            type: String,
            required: true,
            index: true,
        },
        redeemOption: {
            type: [String],
            enum: ['zenless', 'genshin', 'starrail'],
            required: true,
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

export const HoyoCookieModel = mongoose.model<HoyoCookie>('HoyoCookie', HoyoCookieSchema);
