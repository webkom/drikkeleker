require("dotenv").config();
const mongoose = require("mongoose");
const Word = require("./models/Word");

const rawWords = Array.from({ length: 100 }, (_, i) => i.toString());

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Word.deleteMany({});
    const wordObjects = rawWords.map((word) => ({
      word: word,
      difficulty: 400,
    }));
    await Word.insertMany(wordObjects);
    console.log(`Database seeded with ${wordObjects.length} words`);
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};
seedDB();
