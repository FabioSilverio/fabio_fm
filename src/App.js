import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import './App.css';

const PLAYLIST_ID = 'PLpY7hx7jry7yO2su3JjgsaPdp2-bZGPth';
const API_KEY = 'AIzaSyCy5n1tNOT4Cf_qEKE3hiOpWYNhPQVmX1w';

const menuItems = [
  'Music',
  'Videos',
  'Photos',
  'Podcasts',
  'Extras',
  'Settings',
  'Shuffle Songs',
  'Now Playing',
];

function App() {
  const [playlist, setPlaylist] = useState([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const playerRef = useRef(null);

  // Busca os vídeos da playlist do YouTube
  useEffect(() => {
    async function fetchPlaylist() {
      setLoading(true);
      setErrorMsg('');
      let items = [];
      let nextPageToken = '';
      try {
        do {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`
          );
          if (!res.ok) {
            throw new Error('Erro de rede: ' + res.status);
          }
          const data = await res.json();
          if (data.error) {
            console.error('YouTube API error:', data.error);
            let msg = 'Erro ao carregar a playlist.';
            if (data.error.code === 403 && data.error.errors[0].reason === 'quotaExceeded') {
              msg = 'Limite de uso da API do YouTube excedido. Tente novamente mais tarde.';
            } else if (data.error.code === 400 && data.error.errors[0].reason === 'keyInvalid') {
              msg = 'Chave de API inválida.';
            } else if (data.error.code === 404 || data.error.errors[0].reason === 'playlistNotFound') {
              msg = 'Playlist não encontrada ou privada.';
            } else if (data.error.code === 403 && data.error.errors[0].reason === 'accessNotConfigured') {
              msg = 'A YouTube Data API não está ativada no seu projeto Google Cloud.';
            } else {
              msg = data.error.message || msg;
            }
            setErrorMsg(msg);
            throw new Error(msg);
          }
          if (data.items) {
            items = items.concat(data.items);
          }
          nextPageToken = data.nextPageToken;
        } while (nextPageToken);
        const formatted = items.map((item) => ({
          videoId: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          artist: item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle,
          cover: item.snippet.thumbnails?.medium?.url || '',
        }));
        setPlaylist(formatted);
      } catch (e) {
        setPlaylist([]);
        setLoading(false);
        if (!errorMsg) {
          setErrorMsg('Erro inesperado ao carregar a playlist. Verifique sua conexão ou tente novamente.');
        }
        return;
      }
      setLoading(false);
    }
    fetchPlaylist();
  }, []);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % playlist.length);
    setPlaying(true);
  };

  const handlePausePlay = () => {
    if (!playerRef.current || !playerRef.current.internalPlayer) return;
    if (playing) {
      playerRef.current.internalPlayer.pauseVideo();
    } else {
      playerRef.current.internalPlayer.unMute();
      playerRef.current.internalPlayer.playVideo();
    }
    setPlaying((p) => !p);
  };

  const fadeInVolume = (player, duration = 2000) => {
    let volume = 0;
    try {
      player.setVolume(0);
      player.unMute();
    } catch (e) {
      return;
    }
    const steps = 20;
    const stepTime = duration / steps;
    const increment = 100 / steps;
    const interval = setInterval(() => {
      volume += increment;
      try {
        if (volume >= 100) {
          player.setVolume(100);
          clearInterval(interval);
        } else {
          player.setVolume(volume);
        }
      } catch (e) {
        clearInterval(interval);
      }
    }, stepTime);
  };

  const onReady = (event) => {
    playerRef.current = event.target;
    setReady(true);
  };

  const onEnd = () => {
    handleNext();
  };

  const handleStart = () => {
    setShowOverlay(false);
    setPlaying(true);
    if (playerRef.current) {
      playerRef.current.playVideo();
      fadeInVolume(playerRef.current, 2000);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="ipod-loading">Carregando playlist...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="App">
        <div className="ipod-loading" style={{color: 'red'}}>{errorMsg}</div>
      </div>
    );
  }

  if (!playlist.length) {
    return (
      <div className="App">
        <div className="ipod-loading">Não foi possível carregar a playlist.</div>
      </div>
    );
  }

  return (
    <div className="App">
      {showOverlay && (
        <div className="ipod-overlay">
          <button className="ipod-overlay-btn" onClick={handleStart} disabled={!ready}>
            Clique para ouvir
          </button>
        </div>
      )}
      <div className="ipod-classic">
        <div className="ipod-screen-classic">
          <div className="ipod-menu">
            <div className="ipod-menu-title">iPod</div>
            <ul className="ipod-menu-list">
              {menuItems.map((item, idx) => (
                <li key={item} className={idx === 0 ? 'selected' : ''}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="ipod-cover-area">
            <img className="ipod-cover" src={playlist[current].cover} alt="Album cover" />
          </div>
        </div>
        <div className="ipod-song-info">
          <div className="ipod-song-title">{playlist[current].title}</div>
          <div className="ipod-song-artist">{playlist[current].artist}</div>
        </div>
        <div className="ipod-wheel-classic">
          <div className="ipod-wheel-menu">MENU</div>
          <button className="ipod-wheel-btn left" onClick={handleNext} title="Anterior">⏮️</button>
          <button className="ipod-wheel-btn right" onClick={handleNext} title="Próxima">⏭️</button>
          <button className="ipod-wheel-btn bottom" onClick={handlePausePlay} title="Play/Pause">{playing ? '⏸️' : '▶️'}</button>
          <div className="ipod-wheel-center"></div>
        </div>
        <div style={{ display: 'none' }}>
          <YouTube
            videoId={playlist[current].videoId}
            opts={{ playerVars: { autoplay: 1, mute: 1 } }}
            onReady={onReady}
            onEnd={onEnd}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
