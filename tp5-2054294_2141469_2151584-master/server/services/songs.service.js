const { FileSystemManager } = require("./file_system_manager");
const { dbService } = require("./database.service");
const DB_CONSTS = require("../utils/env");

const path = require("path");

class SongService {
  constructor () {
    this.JSON_PATH = path.join(__dirname + "../../data/songs.json");
    this.fileSystemManager = new FileSystemManager();
    this.dbService = dbService;
  }

  get collection () {
    return this.dbService.db.collection(DB_CONSTS.DB_COLLECTION_SONGS);
  }

  async getAllSongs () {
    const playlists = await this.collection.find({}).toArray();
    return playlists;
  }

  async getSongById (id) {
    const queryId = { id: parseInt(id) };
    return await this.collection.findOne(queryId);
  }

  async updateSongLike (id) {
    const song = await this.getSongById(id);
    const setQuery = { $set: { liked: !song.liked } }
    const filtre = { id: parseInt(song.id) }
    this.collection.updateOne(filtre, setQuery);
    return song.liked;
  }

  async search (substring, exact) {
    const filterName = { name: { $regex: `${substring}`, $options: "i" } };
    const filterArtist = { artist: { $regex: `${substring}`, $options: "i" } };
    const filterGenre = { genre: { $regex: `${substring}`, $options: "i" } };
    const filterNameSensitiveCase = { name: { $regex: `${substring}` } };
    const filterArtistSensitiveCase = { artist: { $regex: `${substring}` } };
    const filterGenreSensitiveCase = { genre: { $regex: `${substring}` } };

    if (exact) {
      const songs = await this.collection.find({
        $or: [filterNameSensitiveCase, filterArtistSensitiveCase,
          filterGenreSensitiveCase]
      }).toArray();
      return songs
    }
    const songs = await this.collection.find({ $or: [filterName, filterArtist, filterGenre] }).toArray();
    return songs;
  }

  async populateDb () {
    const songs = JSON.parse(await this.fileSystemManager.readFile(this.JSON_PATH)).songs;
    await this.dbService.populateDb(DB_CONSTS.DB_COLLECTION_SONGS, songs);
  }
}

module.exports = { SongService };
