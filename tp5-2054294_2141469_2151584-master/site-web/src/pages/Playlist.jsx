import React, { useState, useEffect, useContext } from "react";
import { ACTIONS } from "../reducers/reducer";
import PlaylistContext from "../contexts/PlaylistContext";
import { SERVER_URL } from "../assets/js/consts";
import { NavLink, useParams } from "react-router-dom";

export default function Playlist() {
  const api = useContext(PlaylistContext).api;
  const params = useParams();
  const [playlist, setPlaylist] = useState({});
  const [songs, setSongs] = useState([]);
  const { dispatch } = useContext(PlaylistContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const playlist = await api.getPlaylistById(params.id);
    const songsToLoad = await Promise.all(
      playlist.songs.map(async (song) => {
        return await api.fetchSong(song.id);
      })
    );
    setPlaylist(playlist);
    setSongs(songsToLoad);
    dispatch({ type: ACTIONS.LOAD, payload: { songs: songsToLoad } });
  };

  return (
    <main id="main-area" className="flex-column">
      <div id="songs-list">
        <header id="playlist-header" className="flex-row">
          <img
            id="playlist-img"
            width="80px"
            height="80px"
            alt=""
            src={playlist.thumbnail ? `${SERVER_URL}/${playlist.thumbnail}` : ""}
          />
          <h1 id="playlist-title">{playlist.name}</h1>
          <NavLink id="playlist-edit" to={`/create_playlist/${params.id}`}>
            <i className="fa fa-2x fa-pencil"></i>
          </NavLink>
        </header>
        <section id="song-container" className="flex-column">
            {songs.map((song,i)=> (
              <div class = "song-item flex-row" onClick={()=>{dispatch({ type: ACTIONS.PLAY, payload: { index: i} });}} >
                <span>{i+1}</span>
                <p>{song.name}</p>
                <p>{song.genre}</p>
                <p>{song.artist}</p>
                <i className={`${song.liked ? "fa" : "fa-regular"} fa-2x fa-heart`}></i>
              </div>
            ))}
        </section>
      </div>
    </main>
  );
}
