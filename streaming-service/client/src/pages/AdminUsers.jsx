import React, { useState, useEffect } from "react";
import { api } from "../api.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await api.adminListUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(userId) {
    try {
      await api.adminDeleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setDeleteConfirm(null);
    } catch (error) {
      alert(`Failed to delete user: ${error.message}`);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <h1 className="pageTitle">👥 User Management</h1>
        <div style={{ textAlign: "center", padding: 60 }}>Loading users...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="pageTitle">👥 User Management</h1>
      <p className="subtle">Manage user accounts and permissions</p>

      <div style={{ marginTop: 32 }}>
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse",
          backgroundColor: "var(--panel)",
          borderRadius: 12,
          overflow: "hidden"
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: "var(--bg)",
              textAlign: "left"
            }}>
              <th style={{ padding: "16px 20px", fontWeight: 600 }}>ID</th>
              <th style={{ padding: "16px 20px", fontWeight: 600 }}>Username</th>
              <th style={{ padding: "16px 20px", fontWeight: 600 }}>Email</th>
              <th style={{ padding: "16px 20px", fontWeight: 600 }}>Role</th>
              <th style={{ padding: "16px 20px", fontWeight: 600 }}>Joined</th>
              <th style={{ padding: "16px 20px", fontWeight: 600 }}>Activity</th>
              <th style={{ padding: "16px 20px", fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr 
                key={user.id}
                style={{ 
                  borderTop: idx > 0 ? "1px solid var(--border)" : "none"
                }}
              >
                <td style={{ padding: "16px 20px" }}>
                  <span style={{ 
                    fontFamily: "monospace",
                    fontSize: 14,
                    opacity: 0.7
                  }}>
                    #{user.id}
                  </span>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <strong>{user.username}</strong>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <span style={{ opacity: 0.7 }}>
                    {user.email || <em>No email</em>}
                  </span>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    backgroundColor: user.role === 'admin' ? "var(--primary)" : "var(--bg)",
                    color: user.role === 'admin' ? "#fff" : "inherit"
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <span style={{ opacity: 0.7, fontSize: 14 }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    <div>📋 {user.watchlistCount} watchlist</div>
                    <div>⭐ {user.ratingsCount} ratings</div>
                    <div>🏆 {user.achievementsCount} achievements</div>
                  </div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  {user.role !== 'admin' && (
                    <>
                      {deleteConfirm === user.id ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => handleDelete(user.id)}
                            style={{
                              padding: "6px 12px",
                              fontSize: 13,
                              fontWeight: 600,
                              backgroundColor: "#dc3545",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer"
                            }}
                          >
                            ✓ Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              padding: "6px 12px",
                              fontSize: 13,
                              fontWeight: 600,
                              backgroundColor: "var(--bg)",
                              color: "inherit",
                              border: "1px solid var(--border)",
                              borderRadius: 6,
                              cursor: "pointer"
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          style={{
                            padding: "6px 12px",
                            fontSize: 13,
                            fontWeight: 600,
                            backgroundColor: "var(--bg)",
                            color: "#dc3545",
                            border: "1px solid #dc3545",
                            borderRadius: 6,
                            cursor: "pointer"
                          }}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div style={{ 
            textAlign: "center", 
            padding: 60,
            opacity: 0.5 
          }}>
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
