import mongoose, { ObjectId } from 'mongoose';

const Schema = mongoose.Schema;

export type KuroNoti = {
    _id: ObjectId;
    discordID: string;
    notifiedCodes: string[];
    game: 'pgr' | 'wuwa';
    createdAt: Date;
    updatedAt: Date;
};

const KuroNotiSchema = new Schema<KuroNoti>(
    {
        discordID: {
            type: String,
            required: true,
            index: true,
        },
        notifiedCodes: {
            type: [String],
            default: [],
            index: true,
        },
        game: {
            type: String,
            enum: ['pgr', 'wuwa'],
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export const KuroNotiModel = mongoose.model<KuroNoti>('KuroNoti', KuroNotiSchema);
