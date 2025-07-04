const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    minFreeShipping: {
      type: Number,
      required: true,
      default: 25000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Config", configSchema);
