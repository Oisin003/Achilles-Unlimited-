import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, fileUrl, getAuth } from "../api.js";

export default function Audiobooks() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");
  const isAdmin = getAuth();

  function refresh() {
    const params = {};
    if (search) params.search = search;
    
    api.listDocuments(params)
      .then(setDocuments)
      .catch(e => setErr(e.message));
  }

  useEffect(() => { refresh(); }, [search]);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="pageTitle" style={{ margin: 0 }}>Audiobooks</h1>
          <div className="pill" style={{ marginTop: 8 }}>{documents.length} audiobook{documents.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search audiobooks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 300, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'inherit' }}
          />
          {isAdmin && (
            <Link to="/admin/documents/new" className="btn btnPrimary btnSmall">
              <i className="bi bi-plus-circle"></i> Upload Book
            </Link>
          )}
        </div>
      </div>

      {err && <div className="error">{err}</div>}

      {documents.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, opacity: 0.5 }}>
          <i className="bi bi-book" style={{ fontSize: 48 }}></i>
          <p style={{ marginTop: 16 }}>No audiobooks available yet.</p>
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
          gap: 24 
        }}>
          {documents.map(doc => (
            <div 
              key={doc.id}
              style={{ 
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid var(--border-color)"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              {doc.coverPath ? (
                <img 
                  src={fileUrl(doc.coverPath)} 
                  alt={doc.title}
                  style={{ 
                    width: "100%", 
                    height: 300, 
                    objectFit: "cover",
                    backgroundColor: "var(--border)"
                  }}
                />
              ) : (
                <div style={{ 
                  width: "100%", 
                  height: 300, 
                  backgroundColor: "var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <i className="bi bi-file-earmark-text" style={{ fontSize: 60, opacity: 0.3 }}></i>
                </div>
              )}
              <div style={{ padding: 12 }}>
                <h3 style={{ margin: 0, marginBottom: 4, fontSize: 16 }}>{doc.title}</h3>
                {doc.author && (
                  <p style={{ margin: 0, fontSize: 14, opacity: 0.6 }}>{doc.author}</p>
                )}
                <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="badge" style={{ fontSize: 11 }}>{doc.fileType}</span>
                  {doc.pageCount && (
                    <span style={{ fontSize: 12, opacity: 0.5 }}>{doc.pageCount} pages</span>
                  )}
                  {doc.chapterCount > 0 && (
                    <span style={{ fontSize: 12, opacity: 0.5 }}>{doc.chapterCount} chapters</span>
                  )}
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <Link 
                    to={`/read/${doc.id}`}
                    className="btn btnPrimary btnSmall"
                    style={{ flex: 1 }}
                  >
                    <i className="bi bi-book"></i> Read
                  </Link>
                  <Link 
                    to={`/audiobook/${doc.id}`}
                    className="btn btnSecondary btnSmall"
                    style={{ flex: 1 }}
                  >
                    <i className="bi bi-headphones"></i> Listen
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
