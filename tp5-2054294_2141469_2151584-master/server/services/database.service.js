const { MongoClient } = require("mongodb");
const DB_CONSTS = require("../utils/env");

class DatabaseService {
  async populateDb (collectionName, data) {
    const dataCollection = this.db.collection(collectionName);
    if (!((await dataCollection.find({}).toArray()).length)) {
      await dataCollection.insertMany(data);
    }
  }

  async connectToServer (uri) {
    try {
      this.client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      await this.client.connect();
      this.db = this.client.db(DB_CONSTS.DB_DB);
      // eslint-disable-next-line no-console
      console.log("Successfully connected to MongoDB.");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
}

const dbService = new DatabaseService();

module.exports = { dbService };
