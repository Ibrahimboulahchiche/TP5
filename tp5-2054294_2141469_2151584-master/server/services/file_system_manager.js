const fs = require("fs");

class FileSystemManager {
  async readFile (path) {
    return await fs.promises.readFile(path);
  }
}

module.exports = { FileSystemManager };
