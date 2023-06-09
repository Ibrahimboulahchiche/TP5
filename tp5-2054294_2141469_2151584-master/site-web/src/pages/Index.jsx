import React, { useState, useEffect, useContext } from "react";
import Playlist from "../components/Playlist";
import Song from "../components/Song";
import SearchBar from "../components/SearchBar";
import PlaylistContext from "../contexts/PlaylistContext";

export default function Index() {
  const api = useContext(PlaylistContext).api;
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  useEffect(() => {
    api
      .fetchAllPlaylists()
      .then((playlists) => setPlaylists(playlists))
      .catch(() => setPlaylists([]));
    api
    .fetchAllSongs()
    .then((songs)=>setSongs(songs))
    .catch(()=> setSongs([]));
  }, []);

  const handleSearch = async (event, query, exactMatch) => {
    event.preventDefault();
    const search = await api.search(query,exactMatch);
    setSongs(search.songs);
    setPlaylists(search.playlists);
  };
  
  return (
    <>
      <main id="main-area" className="flex-column">
        <SearchBar handleSearch={handleSearch}/>
        <div id="playlist-list">
          <h1>Mes Playlists</h1>
          <section id="playlist-container" className="playlist-container">
            {playlists.map((playlist) => (
              <Playlist key={playlist.id} playlist={playlist} />
            ))}
          </section>
        </div>
        <div id="songs-list">
          <h1>Mes Chansons</h1>
          <section id="song-container" className="flex-column">
            {songs.map((song,i) => (
              <Song key={i} song={song} />
            ))}
          </section>
        </div>
      </main>
    </>
  );
}