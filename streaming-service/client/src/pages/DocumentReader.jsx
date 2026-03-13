import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, fileUrl } from "../api.js";
import { useUser } from "../UserContext.jsx";
import Reviews from "../components/Reviews.jsx";

export default function DocumentReader() {
  const { id, chapterNum } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [document, setDocument] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [chapterContent, setChapterContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showChapterList, setShowChapterList] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [maxWidth, setMaxWidth] = useState(800);

  const currentChapterNumber = parseInt(chapterNum) || 1;

  useEffect(() => {
    loadDocument();
  }, [id]);

  useEffect(() => {
    if (chapters.length > 0) {
      loadChapter(currentChapterNumber);
    }
  }, [currentChapterNumber, chapters]);

  async function loadDocument() {
    setLoading(true);
    setErr("");
    try {
      const [doc, chapterList] = await Promise.all([
        api.getDocument(id),
        api.getDocumentChapters(id)
      ]);
      
      setDocument(doc);
      setChapters(chapterList);
      
      // Load reading progress
      if (user) {
        try {
          const progress = await api.getReadingProgress(user.id, id);
          if (progress && progress.currentChapter && !chapterNum) {
            // Navigate to the last read chapter if no specific chapter is in URL
            navigate(`/read/${id}/${progress.currentChapter}`, { replace: true });
            return;
          }
        } catch (progressErr) {
          console.warn("Could not load progress:", progressErr);
        }
      }
    } catch (error) {
      console.error("Error loading document:", error);
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadChapter(chapterNumber) {
    try {
      const chapter = await api.getDocumentChapter(id, chapterNumber);
      setCurrentChapter(chapter);
      setChapterContent(chapter.content);
      
      // Save reading progress
      if (user) {
        await api.saveReadingProgress({
          userId: user.id,
          documentId: parseInt(id),
          currentChapter: chapterNumber,
          currentPosition: 0,
          progress: (chapterNumber / chapters.length) * 100
        });
      }
      
      // Scroll to top when chapter changes
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error loading chapter:", error);
      setErr(error.message);
    }
  }

  function goToChapter(chapterNumber) {
    navigate(`/read/${id}/${chapterNumber}`);
    setShowChapterList(false);
  }

  function nextChapter() {
    if (currentChapterNumber < chapters.length) {
      goToChapter(currentChapterNumber + 1);
    }
  }

  function previousChapter() {
    if (currentChapterNumber > 1) {
      goToChapter(currentChapterNumber - 1);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="error" style={{ margin: "20px" }}>
        {err}
      </div>
    );
  }

  if (!document || !currentChapter) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>Document or chapter not found</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column",
      minHeight: "calc(100vh - 120px)"
    }}>
      {/* Header with controls */}
      <div style={{
        borderBottom: "1px solid var(--border-color)",
        padding: "12px 20px",
        position: "sticky",
        top: 0,
        backgroundColor: "var(--bg-color)",
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
      }}>
        <div style={{ 
          maxWidth: maxWidth,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px"
        }}>
          {/* Left side - navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link 
              to="/audiobooks" 
              className="btn btnSecondary btnSmall"
              style={{ padding: "6px 12px" }}
            >
              <i className="bi bi-arrow-left"></i>
            </Link>
            <button 
              onClick={() => setShowChapterList(!showChapterList)}
              className="btn btnSecondary btnSmall"
              style={{ padding: "6px 12px" }}
            >
              <i className="bi bi-list"></i>
            </button>
          </div>
          
          {/* Center - title (compact) */}
          <div style={{ 
            flex: "1",
            textAlign: "center",
            minWidth: 0,
            overflow: "hidden"
          }}>
            <div style={{ 
              fontSize: "14px",
              fontWeight: "500",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "var(--text-color)"
            }}>
              {document.title}
              {document.author && (
                <span style={{ 
                  color: "var(--text-muted)",
                  fontWeight: "normal",
                  marginLeft: "8px"
                }}>
                  • {document.author}
                </span>
              )}
            </div>
          </div>

          {/* Right side - font controls and chapter selector */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Chapter dropdown */}
            <select
              value={currentChapterNumber}
              onChange={(e) => goToChapter(parseInt(e.target.value))}
              className="btn btnSecondary btnSmall"
              style={{
                padding: "6px 12px",
                cursor: "pointer",
                maxWidth: "200px"
              }}
            >
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.chapterNumber}>
                  Ch. {chapter.chapterNumber}: {chapter.title}
                </option>
              ))}
            </select>
            
            <div style={{ 
              width: "1px", 
              height: "24px", 
              backgroundColor: "var(--border-color)" 
            }} />
            
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 2))}
              className="btn btnSecondary btnSmall"
              title="Decrease font size"
              style={{ padding: "6px 10px", minWidth: "auto" }}
            >
              <i className="bi bi-dash"></i>
            </button>
            <button
              onClick={() => setFontSize(Math.min(32, fontSize + 2))}
              className="btn btnSecondary btnSmall"
              title="Increase font size"
              style={{ padding: "6px 10px", minWidth: "auto" }}
            >
              <i className="bi bi-plus"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Chapter list sidebar */}
      {showChapterList && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setShowChapterList(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 98
            }}
          />
          {/* Sidebar */}
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: "280px",
            backgroundColor: "var(--bg-color)",
            borderRight: "1px solid var(--border-color)",
            overflowY: "auto",
            zIndex: 99,
            padding: "16px",
            boxShadow: "2px 0 16px rgba(0,0,0,0.2)"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: "1px solid var(--border-color)"
            }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>Chapters</h3>
              <button 
                onClick={() => setShowChapterList(false)}
                className="btn btnSecondary btnSmall"
                style={{ padding: "4px 8px" }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => goToChapter(chapter.chapterNumber)}
                  className={`btn ${chapter.chapterNumber === currentChapterNumber ? 'btnPrimary' : 'btnSecondary'}`}
                  style={{
                    textAlign: "left",
                    justifyContent: "flex-start",
                    padding: "10px 12px",
                    fontSize: "13px"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "500" }}>
                      {chapter.title}
                    </div>
                    {chapter.wordCount > 0 && (
                      <div style={{ 
                        fontSize: "11px", 
                        opacity: 0.6,
                        marginTop: "2px"
                      }}>
                        {chapter.wordCount.toLocaleString()} words
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main content area */}
      <div style={{ 
        flex: 1,
        padding: "40px 20px",
        backgroundColor: "var(--bg-color)"
      }}>
        <div style={{ 
          maxWidth: maxWidth,
          margin: "0 auto"
        }}>
          {/* Chapter header */}
          <div style={{
            marginBottom: "40px",
            paddingBottom: "20px",
            borderBottom: "2px solid var(--border-color)"
          }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <p style={{ 
                margin: "0 0 8px 0",
                fontSize: "13px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: "600"
              }}>
                Chapter {currentChapterNumber} of {chapters.length}
              </p>
              <h1 style={{ 
                margin: 0,
                fontSize: "32px",
                fontWeight: "700",
                color: "var(--text-color)",
                letterSpacing: "-0.5px"
              }}>
                {currentChapter.title}
              </h1>
              {currentChapter.wordCount > 0 && (
                <p style={{ 
                  margin: "8px 0 0 0",
                  fontSize: "13px",
                  color: "var(--text-muted)"
                }}>
                  {currentChapter.wordCount.toLocaleString()} words
                </p>
              )}
            </div>
            
            {/* Chapter navigation */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              padding: "16px",
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "8px"
            }}>
              <button
                onClick={previousChapter}
                disabled={currentChapterNumber === 1}
                className="btn btnSecondary"
                style={{ flex: "0 0 auto" }}
              >
                <i className="bi bi-chevron-left"></i> Previous
              </button>
              
              {/* Chapter selector */}
              <select
                value={currentChapterNumber}
                onChange={(e) => goToChapter(parseInt(e.target.value))}
                className="btn btnSecondary"
                style={{
                  flex: "1",
                  maxWidth: "400px",
                  padding: "10px 16px",
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.chapterNumber}>
                    Chapter {chapter.chapterNumber}: {chapter.title}
                  </option>
                ))}
              </select>
              
              <button
                onClick={nextChapter}
                disabled={currentChapterNumber === chapters.length}
                className="btn btnSecondary"
                style={{ flex: "0 0 auto" }}
              >
                Next <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          {/* Chapter content */}
          <div 
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              color: "var(--text-color)",
              fontFamily: "Georgia, 'Times New Roman', serif",
              textAlign: "justify",
              hyphens: "auto"
            }}
          >
            {chapterContent}
          </div>

          {/* Bottom navigation */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginTop: "60px",
            paddingTop: "24px",
            paddingBottom: "20px",
            borderTop: "2px solid var(--border-color)"
          }}>
            <button
              onClick={previousChapter}
              disabled={currentChapterNumber === 1}
              className="btn btnSecondary"
              style={{ flex: "0 0 auto" }}
            >
              <i className="bi bi-chevron-left"></i> Previous Chapter
            </button>
            
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn btnSecondary"
              title="Back to top"
            >
              <i className="bi bi-arrow-up"></i> Top
            </button>
            
            <button
              onClick={nextChapter}
              disabled={currentChapterNumber === chapters.length}
              className="btn btnSecondary"
              style={{ flex: "0 0 auto" }}
            >
              Next Chapter <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      {user && (
        <div style={{ 
          maxWidth: maxWidth,
          margin: "0 auto",
          padding: "40px 20px",
          width: "100%"
        }}>
          <Reviews contentId={parseInt(id)} contentType="document" />
        </div>
      )}
    </div>
  );
}
