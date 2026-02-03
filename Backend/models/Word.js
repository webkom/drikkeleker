const mongoose = require("mongoose");

const aliasWord = new mongoose.Schema({
  difficulty: {
    type: Number,
    required: true,
    default: 400,
  },
  word: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

const currentWord = mongoose.model("Word", aliasWord);

module.exports = currentWord;
