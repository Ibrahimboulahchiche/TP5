const { FileSystemManager } = require("./file_system_manager");
const { dbService } = require("./database.service");
const DB_CONSTS = require("../utils/env");
const path = require("path");
const { randomUUID } = require("crypto");
const fs = require("fs");

class PlaylistService {
  constructor () {
    this.JSON_PATH = path.join(__dirname + "../../data/playlists.json");
    this.fileSystemManager = new FileSystemManager();
    this.dbService = dbService;
  }

  get collection () {
    return this.dbService.db.collection(DB_CONSTS.DB_COLLECTION_PLAYLISTS);
  }

  async getAllPlaylists () {
    const playlists = await this.collection.find({}).toArray();
    return playlists;
  }

  async getPlaylistById (id) {
    const queryid = { id };
    const playlistId = await this.collection.find(queryid).toArray();
    if (playlistId.length) {
      return playlistId[0];
    }
    return null;
  }

  async addPlaylist (playlist) {
    playlist.id = randomUUID();
    await this.savePlaylistThumbnail(playlist);
    await this.collection.insertOne(playlist);
    return playlist;
  }

  async updatePlaylist (playlist) {
    delete playlist._id;
    await this.savePlaylistThumbnail(playlist);
    const filter = { id: playlist.id };
    const setQuery = {
      $set: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        thumbnail: playlist.thumbnail,
        songs: playlist.songs
      }
    };
    await this.collection.updateOne(filter, setQuery);
  }

  async chooseProperEncoding (picture) {
    if (picture.startsWith("data:image/jpeg;base64,")) {
      return "jpeg";
    } else if (picture.startsWith("data:image/png;base64,")) {
      return "png";
    } else if (picture.startsWith("data:image/bmp;base64,")) {
      return "bmp";
    } else if (picture.startsWith("data:image/jpg;base64,")) {
      return "jpg";
    } else {
      throw new Error("Invalid image format");
    }
  }

  async deletePlaylist (id) {
    const res = await this.collection.findOneAndDelete({ id });
    if (res.value) {
      const tnail = res.value.thumbnail;
      await this.deletePlaylistThumbnail(tnail);
    }
    return res.value !== null;
  }

  async deletePlaylistThumbnail (filePath) {
    return fs.promises.unlink(filePath);
  }

  async savePlaylistThumbnail (playlist) {
    const fileFormat = await this.chooseProperEncoding(playlist.thumbnail);
    const thumbnailData = playlist.thumbnail.replace(`data:image/${fileFormat};base64,`, "");
    const thumbnailFileName = `assets/img/${playlist.id}.${fileFormat}`;
    const filePath = path.join(__dirname + `../../assets/img/${playlist.id}.${fileFormat}`);
    await fs.promises.writeFile(filePath, thumbnailData, { encoding: "base64" });
    playlist.thumbnail = thumbnailFileName;
  }

  async search (substring, exact) {
    const filterName = { name: { $regex: `${substring}`, $options: "i" } };
    const filterDescription = { description: { $regex: `${substring}`, $options: "i" } };
    const filterSensitiveCaseName = { name: { $regex: `${substring}` } };
    const filterSensitiveCaseDescription = { description: { $regex: `${substring}` } };
    if (exact) {
      const playlists = await this.collection.find({
        $or: [filterSensitiveCaseName, filterSensitiveCaseDescription]
      }).toArray();
      return playlists
    }
    const playlists = await this.collection.find({
      $or: [filterName, filterDescription]
    }).toArray();
    return playlists;
  }

  async populateDb () {
    const playlists = JSON.parse(await this.fileSystemManager.readFile(this.JSON_PATH)).playlists;
    await this.dbService.populateDb(DB_CONSTS.DB_COLLECTION_PLAYLISTS, playlists);
  }
}
module.exports = { PlaylistService };
