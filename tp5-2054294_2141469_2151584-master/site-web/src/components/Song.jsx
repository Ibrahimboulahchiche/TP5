import React, { useState, useContext } from "react";
import { ACTIONS } from "../reducers/reducer";

import PlaylistContext from "../contexts/PlaylistContext";

export default function Song({ song, index }) {
  const api = useContext(PlaylistContext).api;
  const { dispatch } = useContext(PlaylistContext);
  const [liked, setLiked] = useState(song.liked);
  const toggleLike = () => {
    setLiked(!liked);
    api.updateSong(song.id)
  };

  const playSong = () => {dispatch({type:ACTIONS.PLAY, PAYLOAD : {index:index- 1}})};
  return (
    <section
      className="song-item flex-row"
      onClick = {index ? () => 
        { playSong()}: ()=>{}
      }
    >
      {index ? <span>{index}</span> : <></>}
      <p>{song.name}</p>
      <p>{song.genre}</p>
      <p>{song.artist}</p>
      <button
        className={`${liked ? "fa" : "fa-regular"} fa-2x fa-heart`}
        onClick={index ? () => {} : toggleLike}
      ></button>
    </section>
  );
}
