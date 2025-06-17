import mongoose, { ObjectId } from 'mongoose';

const Schema = mongoose.Schema;

export type HoyoCookie = {
  _id: ObjectId;
  cookie: string;
  discordID: string;
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
  },
  {
    timestamps: true,
  },
);

export const HoyoCookieModel = mongoose.model<HoyoCookie>(
  'HoyoCookie',
  HoyoCookieSchema,
);
