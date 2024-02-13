const { Schema, Types } = require('mongoose');

const reactionSchema = new Schema(
  {
    reactionId: {
      type: Types.ObjectId,
      default: () => new Types.ObjectId(),
    },
    reactionBody: {
      type: String,
      required: true,
      maxlength: 280,
    },
    username: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

// Getter method to format the timestamp on query
reactionSchema.virtual('formattedCreatedAt').get(function () {
  return this.createdAt.toISOString(); // Format timestamp as ISO string
});

module.exports = reactionSchema;
