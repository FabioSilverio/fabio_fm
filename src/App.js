import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import './App.css';

const PLAYLISTS = [
  { name: 'Rock', id: 'PLSJkIg_k31H-il-rxsoqqepcvZqAiPpUv' },
  { name: 'Pop', id: 'PLDIoUOhQQPlXqz5QZ3dx-lh_p6RcPeKjv' },
  { name: 'Jazz', id: 'PLiy0XOfUv4hFHmPs0a8RqkDzfT-2nw7WV' },
];
const API_KEY = 'AIzaSyCy5n1tNOT4Cf_qEKE3hiOpWYNhPQVmX1w';

function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function App() {
  const [selectedPlaylist, setSelectedPlaylist] = useState(PLAYLISTS[0].id);
  const [playlist, setPlaylist] = useState([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showOverlay, setShowOverlay] = useState(true);
  const [showLive, setShowLive] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    async function fetchPlaylist() {
      setLoading(true);
      setErrorMsg('');
      let items = [];
      let nextPageToken = '';
      try {
        do {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${selectedPlaylist}&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`
          );
          if (!res.ok) {
            throw new Error('Erro de rede: ' + res.status);
          }
          const data = await res.json();
          if (data.error) {
            setErrorMsg('Erro ao carregar a playlist.');
            throw new Error(data.error.message);
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
        setPlaylist(shuffleArray(formatted));
        setCurrent(0);
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
  }, [selectedPlaylist]);

  useEffect(() => {
    if (playerRef.current && playerRef.current.internalPlayer && !showOverlay) {
      playerRef.current.internalPlayer.unMute();
      playerRef.current.internalPlayer.playVideo();
    }
  }, [current, showOverlay]);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % playlist.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const handlePausePlay = () => {
    if (!playerRef.current || !playerRef.current.internalPlayer) return;
    if (playing) {
      playerRef.current.internalPlayer.pauseVideo();
    } else {
      playerRef.current.internalPlayer.unMute();
      playerRef.current.internalPlayer.playVideo();
    }
  };

  const onReady = (event) => {
    playerRef.current = event.target;
    setReady(true);
    if (!showOverlay) {
      event.target.unMute();
      event.target.playVideo();
    }
  };

  const onEnd = () => {
    handleNext();
  };

  const onPlayerPlay = () => setPlaying(true);
  const onPlayerPause = () => setPlaying(false);

  if (loading) {
    return (
      <div className="modern-bg">
        <div className="modern-loading">Carregando playlist...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="modern-bg">
        <div className="modern-loading" style={{color: 'red'}}>{errorMsg}</div>
      </div>
    );
  }

  if (!playlist.length) {
    return (
      <div className="modern-bg">
        <div className="modern-loading">Não foi possível carregar a playlist.</div>
      </div>
    );
  }

  return (
    <div className="modern-bg">
      {showOverlay && (
        <div className="modern-overlay">
          <button className="modern-overlay-btn" onClick={() => { setShowOverlay(false); setPlaying(true); }} disabled={!ready}>
            Clique para ouvir
          </button>
        </div>
      )}
      <div className="modern-card">
        <div className="modern-extra">
          <select
            className="modern-select"
            value={selectedPlaylist}
            onChange={e => setSelectedPlaylist(e.target.value)}
            disabled={showLive}
          >
            {PLAYLISTS.map(pl => (
              <option key={pl.id} value={pl.id}>{pl.name}</option>
            ))}
          </select>
          <button
            className="modern-live-btn"
            onClick={() => setShowLive((v) => !v)}
            style={{ marginLeft: 8 }}
          >
            {showLive ? 'Voltar' : 'AO VIVO'}
          </button>
          <div className="modern-date">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
            {' • '}
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        {showLive ? (
          <div className="modern-live-iframe-container">
            <iframe
              src="https://player.twitch.tv/?channel=fagulhu&parent=localhost&parent=fabiofm.vercel.app"
              height="300"
              width="100%"
              allowFullScreen
              frameBorder="0"
              title="Twitch Live"
              className="modern-live-iframe"
            ></iframe>
            <div className="modern-live-label">AO VIVO - Twitch.tv/fagulhu</div>
          </div>
        ) : (
          <>
            <div className="modern-cover-glow">
              <img className="modern-cover" src={playlist[current].cover} alt="Album cover" />
            </div>
            <div className="modern-info">
              <div className="modern-title">{playlist[current].title}</div>
              <div className="modern-artist">{playlist[current].artist}</div>
            </div>
            <div className="modern-controls">
              <button className="modern-btn" onClick={handlePrev} title="Anterior">⏮️</button>
              <button className="modern-btn play" onClick={handlePausePlay} title="Play/Pause">
                {playing ? '⏸️' : '▶️'}
              </button>
              <button className="modern-btn" onClick={handleNext} title="Próxima">⏭️</button>
            </div>
            <div style={{ display: 'none' }}>
              <YouTube
                videoId={playlist[current].videoId}
                opts={{ playerVars: { autoplay: 1, mute: 0 } }}
                onReady={onReady}
                onEnd={onEnd}
                onPlay={onPlayerPlay}
                onPause={onPlayerPause}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
