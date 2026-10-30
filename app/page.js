"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { eventConfig } from "../config/event";

const CLOUD_NAME = eventConfig.cloudName;
const UPLOAD_PRESET = eventConfig.uploadPreset;
const CLOUDINARY_FOLDER = eventConfig.cloudinaryFolder;

// --- Clean SVG Icons ---
const IconCamera = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="dropzone-icon-svg"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconClose = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconPlay = () => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 24 24"
    fill="white"
    style={{ opacity: 0.8 }}
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploaderName, setUploaderName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [localSessionPhotos, setLocalSessionPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = eventConfig.itemsPerPage || 24;
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [photosLoaded, setPhotosLoaded] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);

  const fileInputRef = useRef(null);
  const galleryRef = useRef(null);
  const tabsRef = useRef(null);

  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadPhotos = useCallback(async () => {
    setLoadingPhotos(true);
    try {
      const res = await fetch("/api/photos");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setPhotos([...localSessionPhotos, ...(data.photos || [])]);
    } catch (err) {
      console.error("Error loading photos:", err);
      showToast("Could not load the collection", true);
    } finally {
      setLoadingPhotos(false);
      setPhotosLoaded(true);
    }
  }, [showToast, localSessionPhotos]);

  const totalPages = Math.ceil(photos.length / itemsPerPage);
  const paginatedPhotos = photos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const Pagination = ({ isTop = false }) => (
    <div className={`gallery-pagination ${isTop ? "top" : ""}`}>
      <button
        className="page-btn nav-btn"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {[...Array(totalPages)].map((_, i) => {
        const pageNum = i + 1;
        return (
          <button
            key={pageNum}
            className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
            onClick={() => handlePageChange(pageNum)}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        className="page-btn nav-btn"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );

  useEffect(() => {
    if (activeTab === "gallery" && !photosLoaded) {
      loadPhotos();
    }
  }, [activeTab, photosLoaded, loadPhotos]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const imageFiles = newFiles.filter(
      (f) =>
        f.type.startsWith("image/") ||
        f.type.startsWith("video/") ||
        f.name.toLowerCase().endsWith(".heic") ||
        f.name.toLowerCase().endsWith(".heif") ||
        f.type === ""
    );

    if (imageFiles.length === 0) {
      if (newFiles.length > 0)
        showToast(`Unsupported file: ${newFiles[0].type || "format"}`, true);
      return;
    }

    setFiles((prev) => [...prev, ...imageFiles]);

    imageFiles.forEach((file) => {
      if (
        file.type.startsWith("image/") ||
        file.type === "" ||
        file.name.toLowerCase().endsWith(".heic")
      ) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews((prev) => [
            ...prev,
            { url: e.target.result, name: file.name, type: "image" },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        try {
          const videoUrl = URL.createObjectURL(file);
          setPreviews((prev) => [
            ...prev,
            { url: videoUrl, name: file.name, type: "video" },
          ]);
        } catch (err) {
          console.error("Video preview error:", err);
        }
      }
    });
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    let uploadedCount = 0;

    // Local Demo Mode fallback when Cloudinary env vars are not yet set
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      const simulatedUploads = previews.map((preview, idx) => ({
        id: `local-${Date.now()}-${idx}`,
        type: preview.type,
        url: preview.url,
        thumbnail: preview.url,
        fullUrl: preview.url,
        uploadedBy: uploaderName.trim() || "A guest",
        createdAt: new Date().toISOString(),
      }));
      setUploadProgress(100);
      setLocalSessionPhotos((prev) => [...simulatedUploads, ...prev]);
      setUploadComplete(true);
      setPhotosLoaded(false);
      setUploading(false);
      showToast("Memories shared (Demo Mode). Thank you.");
      return;
    }

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", CLOUDINARY_FOLDER);
        if (uploaderName.trim()) {
          formData.append("context", `uploaded_by=${uploaderName.trim()}`);
        }

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
          { method: "POST", body: formData }
        );
        if (!res.ok) throw new Error("Upload failed");

        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / files.length) * 100));
      }
      setUploadComplete(true);
      setPhotosLoaded(false);
      showToast("Memories shared. Thank you.");
    } catch (err) {
      showToast("Upload unsuccessful. Please try again.", true);
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFiles([]);
    setPreviews([]);
    setUploadComplete(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openLightbox = (index) => {
    setMediaLoading(true);
    setLightboxIndex(index);
  };
  const closeLightbox = () => {
    setLightboxIndex(-1);
    setMediaLoading(false);
  };
  const prevPhoto = () => {
    setMediaLoading(true);
    setLightboxIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  };
  const nextPhoto = () => {
    setMediaLoading(true);
    setLightboxIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (lightboxIndex < 0) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, photos.length]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="page-container">
      <header className="hero">
        <p className="hero-script">{eventConfig.tagline}</p>
        <h1 className="hero-title">{eventConfig.title}</h1>

        <div className="hero-details">
          <div className="hero-detail">
            <span className="hero-detail-label">
              {eventConfig.locationLabel}
            </span>
            <span className="hero-detail-value">{eventConfig.location}</span>
          </div>
          <div className="hero-detail">
            <span className="hero-detail-label">{eventConfig.dateLabel}</span>
            <span className="hero-detail-value">{eventConfig.date}</span>
          </div>
        </div>

        <p className="hero-message">{eventConfig.welcomeMessage}</p>
      </header>

      <nav className="nav-tabs" ref={tabsRef}>
        <button
          className={`nav-tab ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => handleTabChange("upload")}
        >
          Share
        </button>
        <button
          className={`nav-tab ${activeTab === "gallery" ? "active" : ""}`}
          onClick={() => handleTabChange("gallery")}
        >
          Collection{" "}
          {photos.length > 0 && (
            <span className="photo-count">{photos.length}</span>
          )}
        </button>
      </nav>

      <main className="main-content">
        {activeTab === "upload" && (
          <section className="upload-section">
            <div className="section-header">
              <h2 className="section-title">Upload</h2>
              <p className="section-subtitle">
                Photographs or motion captured by guests
              </p>
            </div>

            <div className="upload-card">
              {!uploadComplete ? (
                <>
                  <div
                    className={`dropzone ${dragOver ? "drag-over" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <IconCamera />
                    <p className="dropzone-text">Tap to select or drop files</p>
                    <p className="dropzone-hint">
                      Images &amp; Video (JPEG, PNG, HEIC, MP4, MOV)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="name-input-group">
                    <label className="name-input-label">
                      Uploader Name (Optional)
                    </label>
                    <input
                      type="text"
                      className="name-input"
                      placeholder="e.g., Sarah"
                      value={uploaderName}
                      onChange={(e) => setUploaderName(e.target.value)}
                    />
                  </div>

                  {previews.length > 0 && (
                    <div className="preview-grid">
                      {previews.map((preview, index) => (
                        <div key={index} className="preview-item">
                          {preview.type === "image" ? (
                            <img src={preview.url} alt="" />
                          ) : (
                            <video src={preview.url} muted />
                          )}
                          <button
                            className="preview-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {files.length > 0 && (
                    <button
                      className="upload-btn"
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      {uploading
                        ? `Processing... ${uploadProgress}%`
                        : `Share ${files.length} ${
                            files.length === 1 ? "Memory" : "Memories"
                          }`}
                    </button>
                  )}
                </>
              ) : (
                <div className="success-message">
                  <h2 className="success-text">Shared successfully.</h2>
                  <p className="hero-script" style={{ marginBottom: "3.5rem" }}>
                    Thank you for the memory.
                  </p>
                  <button className="upload-more-btn" onClick={resetUpload}>
                    Upload More
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "gallery" && (
          <section className="gallery-section">
            <div className="section-header" ref={galleryRef}>
              <h2 className="section-title">The Collection</h2>
              <p className="section-subtitle">Moments shared by our guests</p>
            </div>

            {loadingPhotos ? (
              <div className="gallery-grid">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="gallery-item loading-skeleton"
                    style={{ aspectRatio: "1" }}
                  />
                ))}
              </div>
            ) : photos.length === 0 ? (
              <div className="gallery-empty">
                <p>The collection is currently empty.</p>
              </div>
            ) : (
              <>
                {currentPage > 1 && <Pagination isTop={true} />}

                <div className="gallery-grid">
                  {paginatedPhotos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="gallery-item"
                      onClick={() =>
                        openLightbox((currentPage - 1) * itemsPerPage + index)
                      }
                    >
                      <div className="gallery-image-wrapper">
                        <img src={photo.thumbnail} alt="" loading="lazy" />
                        {photo.type === "video" && (
                          <div className="video-overlay">
                            <IconPlay />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && <Pagination />}
              </>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>{eventConfig.footerText}</p>
      </footer>

      {lightboxIndex >= 0 && photos[lightboxIndex] && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <IconClose />
          </button>

          <div className="lightbox-nav-area">
            <button
              className="lightbox-nav-btn prev"
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
            >
              ‹
            </button>
            <button
              className="lightbox-nav-btn next"
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
            >
              ›
            </button>
          </div>

          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            {mediaLoading && (
              <div className="lightbox-spinner-container">
                <div className="loading-spinner" />
                <p className="loading-text">Loading...</p>
              </div>
            )}

            {photos[lightboxIndex].type === "video" ? (
              <video
                src={photos[lightboxIndex].fullUrl}
                poster={photos[lightboxIndex].thumbnail}
                controls
                playsInline
                preload="auto"
                className={`lightbox-video ${mediaLoading ? "is-loading" : ""}`}
                onLoadedData={() => setMediaLoading(false)}
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={photos[lightboxIndex].fullUrl}
                alt=""
                className={mediaLoading ? "is-loading" : ""}
                onLoad={() => setMediaLoading(false)}
              />
            )}
          </div>
          <div className="lightbox-meta">
            <p className="gallery-meta-name">
              {photos[lightboxIndex].uploadedBy}
            </p>
            <p className="gallery-meta-date">
              {formatDate(photos[lightboxIndex].createdAt)}
            </p>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast show ${toast.isError ? "toast-error" : ""}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
