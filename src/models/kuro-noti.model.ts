import mongoose, { ObjectId } from 'mongoose';

const Schema = mongoose.Schema;

export type KuroNoti = {
  _id: ObjectId;
  discordID: string;
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
  },
  {
    timestamps: true,
  },
);

export const KuroNotiModel = mongoose.model<KuroNoti>(
  'KuroNoti',
  KuroNotiSchema,
);
