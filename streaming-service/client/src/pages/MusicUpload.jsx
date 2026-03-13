import React, { useEffect, useState } from "react";
import { api, fileUrl } from "../api.js";
import { useUser } from "../UserContext.jsx";
import { Link } from "react-router-dom";

export default function MusicUpload() {
  const { user } = useUser();
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [musicList, setMusicList] = useState([]);

  const [form, setForm] = useState({
    title: "",
    artist: "",
    year: "",
    coverPath: "",
    audioPath: ""
  });

  useEffect(() => {
    if (!user) return;
    loadMusic();
  }, [user]);

  async function loadMusic() {
    try {
      const rows = await api.listUserMusic(user.id);
      setMusicList(rows);
    } catch (e) {
      setErr(e.message);
    }
  }

  function update(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function uploadAudio(file) {
    setUploadingAudio(true);
    setAudioProgress(0);
    setErr("");
    try {
      const res = await api.uploadMusicAudio(file, (progress) => setAudioProgress(progress));
      update("audioPath", res.audioPath);
      if (!form.title) {
        const fileName = file.name.replace(/\.mp3$/i, "");
        update("title", fileName);
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploadingAudio(false);
      setAudioProgress(0);
    }
  }

  async function uploadCover(file) {
    setUploadingCover(true);
    setCoverProgress(0);
    setErr("");
    try {
      const res = await api.uploadMusicCover(file, (progress) => setCoverProgress(progress));
      update("coverPath", res.coverPath);
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploadingCover(false);
      setCoverProgress(0);
    }
  }

  async function save(e) {
    e.preventDefault();
    setErr("");
    setSuccess("");

    const payload = {
      userId: user.id,
      title: form.title.trim(),
      artist: form.artist.trim(),
      year: form.year === "" ? null : Number(form.year),
      coverPath: form.coverPath || null,
      audioPath: form.audioPath
    };

    try {
      await api.createMusic(payload);
      setSuccess("Music uploaded successfully.");
      setForm({ title: "", artist: "", year: "", coverPath: "", audioPath: "" });
      loadMusic();
    } catch (e) {
      setErr(e.message);
    }
  }

  if (!user) {
    return (
      <div className="panel formCard">
        <div className="panelBody">
          <h1 className="pageTitle" style={{ margin: 0 }}>Upload Music</h1>
          <div className="subtle" style={{ marginTop: 8 }}>
            You need to sign in to upload music.
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <Link to="/login" className="btn btnPrimary">Sign In</Link>
            <Link to="/register" className="btn btnGhost">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel formCard">
      <div className="panelBody">
        <div className="row">
          <h1 className="pageTitle" style={{ margin: 0 }}>Upload Music</h1>
          <div className="pill">MP3 only</div>
        </div>

        {err && <div className="error">{err}</div>}
        {success && <div className="success">{success}</div>}

        <form className="form" onSubmit={save} style={{ marginTop: 8 }}>
          <label>Song Title *</label>
          <input
            value={form.title}
            onChange={e => update("title", e.target.value)}
            required
            placeholder="Song title"
          />

          <label>Artist *</label>
          <input
            value={form.artist}
            onChange={e => update("artist", e.target.value)}
            required
            placeholder="Artist name"
          />

          <label>Release Year</label>
          <input
            type="number"
            min="1900"
            max="2100"
            value={form.year}
            onChange={e => update("year", e.target.value)}
            placeholder="2024"
          />

          <div className="hr" />

          <label>Audio File * (MP3)</label>
          <input
            type="file"
            accept="audio/mpeg,.mp3"
            onChange={e => e.target.files?.[0] && uploadAudio(e.target.files[0])}
          />
          {uploadingAudio && (
            <div style={{ marginTop: 8 }}>
              <div className="subtle">Uploading audio… {audioProgress}%</div>
              <progress value={audioProgress} max="100" style={{ width: "100%", marginTop: 8 }} />
            </div>
          )}

          <label>Audio Path *</label>
          <input
            value={form.audioPath}
            readOnly
            required
            placeholder="Auto-filled after upload"
          />

          <div className="hr" />

          <label>Cover Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => e.target.files?.[0] && uploadCover(e.target.files[0])}
          />
          {uploadingCover && (
            <div style={{ marginTop: 8 }}>
              <div className="subtle">Uploading cover… {coverProgress}%</div>
              <progress value={coverProgress} max="100" style={{ width: "100%", marginTop: 8 }} />
            </div>
          )}

          <label>Cover Path</label>
          <input
            value={form.coverPath}
            readOnly
            placeholder="Auto-filled after upload"
          />

          <button type="submit" className="btn btnPrimary" disabled={uploadingAudio || uploadingCover}>
            <i className="bi bi-upload"></i> Upload Music
          </button>
        </form>

        <div className="hr" />

        <h2 style={{ marginTop: 6 }}>Your Uploads</h2>
        {musicList.length === 0 ? (
          <div className="subtle" style={{ padding: 12 }}>No uploads yet.</div>
        ) : (
          <div className="table" style={{ marginTop: 12 }}>
            <div className="thead">
              <div>Cover</div>
              <div>Title</div>
              <div>Artist</div>
              <div>Year</div>
              <div>Preview</div>
            </div>
            {musicList.map(m => (
              <div className="trow" key={m.id}>
                <div>
                  {m.coverPath ? (
                    <img
                      src={fileUrl(m.coverPath)}
                      alt={m.title}
                      style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }}
                    />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 6, background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="bi bi-music-note" style={{ opacity: 0.5 }}></i>
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 800 }}>{m.title}</div>
                <div className="subtle">{m.artist}</div>
                <div className="subtle">{m.year || "—"}</div>
                <div>
                  <audio controls style={{ width: 220 }} src={fileUrl(m.audioPath)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
