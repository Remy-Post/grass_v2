import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

/**
 * Singleton document: there is only one SiteSettings record, identified by `key: "default"`.
 * The validated shape lives in @lawnguy/brand SiteSettings (Zod). Stored as Mixed because the
 * underlying spec changes as the website evolves.
 */
const SiteSettingsSchemaDef = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);

export type SiteSettingsDoc = InferSchemaType<typeof SiteSettingsSchemaDef>;

export const SiteSettingsModel: Model<SiteSettingsDoc> =
  mongoose.models.SiteSettings ??
  mongoose.model<SiteSettingsDoc>('SiteSettings', SiteSettingsSchemaDef);
