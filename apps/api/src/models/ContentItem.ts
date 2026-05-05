import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const ContentItemSchemaDef = new Schema(
  {
    kind: { type: String, required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    enabled: { type: Boolean, required: true, default: true, index: true },
    order: { type: Number, required: true, default: 0 },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);

// Each (kind, slug) pair is unique — prevents duplicate seeds.
ContentItemSchemaDef.index({ kind: 1, slug: 1 }, { unique: true });
// Public read pattern.
ContentItemSchemaDef.index({ kind: 1, enabled: 1, order: 1 });

export type ContentItemDoc = InferSchemaType<typeof ContentItemSchemaDef>;

export const ContentItemModel: Model<ContentItemDoc> =
  mongoose.models.ContentItem ?? mongoose.model<ContentItemDoc>('ContentItem', ContentItemSchemaDef);
