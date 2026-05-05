import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const LeadSchemaDef = new Schema(
  {
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    serviceNeed: { type: String, trim: true },
    cadence: { type: String, trim: true },
    yardState: { type: String, trim: true },
    notes: { type: String, trim: true },
    source: { type: String, default: 'contact-form' },
    ip: String,
    userAgent: String,
  },
  { timestamps: true },
);

LeadSchemaDef.index({ createdAt: -1 });

export type LeadDoc = InferSchemaType<typeof LeadSchemaDef>;

export const LeadModel: Model<LeadDoc> =
  mongoose.models.Lead ?? mongoose.model<LeadDoc>('Lead', LeadSchemaDef);
