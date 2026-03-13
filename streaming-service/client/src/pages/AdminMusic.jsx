import React, { useEffect, useState } from "react";
import { api, fileUrl } from "../api.js";

export default function AdminMusic() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  function refresh() {
    api.adminListMusic().then(setItems).catch(e => setErr(e.message));
  }

  useEffect(() => { refresh(); }, []);

  async function del(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;
    setErr("");
    try {
      await api.adminDeleteMusic(id);
      refresh();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div>
      <div className="row">
        <div className="rowLeft">
          <h1 className="pageTitle" style={{ margin: 0 }}>Music Uploads</h1>
          <div className="pill">{items.length} tracks</div>
        </div>
      </div>

      {err && <div className="error">{err}</div>}

      <div className="table" style={{ marginTop: 16 }}>
        <div className="thead">
          <div>Cover</div>
          <div>Title</div>
          <div>Artist</div>
          <div>Year</div>
          <div>Uploader</div>
          <div>Added</div>
          <div>Preview</div>
          <div>Actions</div>
        </div>

        {items.map(m => (
          <div className="trow" key={m.id}>
            <div>
              {m.coverPath ? (
                <img
                  src={fileUrl(m.coverPath)}
                  alt={m.title}
                  style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: 6, backgroundColor: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="bi bi-music-note" style={{ opacity: 0.4 }}></i>
                </div>
              )}
            </div>
            <div style={{ fontWeight: 800 }}>{m.title}</div>
            <div className="subtle">{m.artist}</div>
            <div className="subtle">{m.year || "—"}</div>
            <div className="subtle">{m.username || "—"}</div>
            <div className="subtle">{new Date(m.dateAdded).toLocaleDateString()}</div>
            <div>
              <audio controls style={{ width: 180 }} src={fileUrl(m.audioPath)} />
            </div>
            <div className="actions">
              <button className="btn btnDanger btnSmall" onClick={() => del(m.id, m.title)}>
                <i className="bi bi-trash"></i> Delete
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div style={{ padding: 14 }} className="subtle">
            <i className="bi bi-inbox"></i> No music uploads yet.
          </div>
        )}
      </div>
    </div>
  );
}
