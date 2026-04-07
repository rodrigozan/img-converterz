import { useState, useRef, useCallback } from "react";
import { convertImage, FORMATS, INPUT_ACCEPT, formatFileSize, getFormatById } from "./converter";
import "./App.css";

const QUALITY_OPTIONS = [
  { value: 1.0,  label: "Máxima" },
  { value: 0.92, label: "Alta" },
  { value: 0.75, label: "Média" },
  { value: 0.5,  label: "Baixa" },
];

function FileCard({ file, onRemove, index }) {
  return (
    <div className="file-card" style={{ animationDelay: index * 0.05 + "s" }}>
      <div className="file-thumb-wrap">
        <img src={URL.createObjectURL(file)} alt={file.name} className="file-thumb" />
      </div>
      <div className="file-info">
        <span className="file-name">{file.name}</span>
        <span className="file-size">{formatFileSize(file.size)}</span>
      </div>
      <button className="file-remove" onClick={() => onRemove(index)} title="Remover">✕</button>
    </div>
  );
}

function ResultCard({ result, index }) {
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    a.click();
  };

  return (
    <div className={"result-item" + (result.error ? " has-error" : "")} style={{ animationDelay: index * 0.04 + "s" }}>
      {result.error ? (
        <>
          <div className="result-icon error-icon">✕</div>
          <div className="result-info">
            <span className="result-name">{result.original}</span>
            <span className="result-error">{result.error}</span>
          </div>
        </>
      ) : (
        <>
          <div className="result-preview-wrap">
            <img src={result.url} alt={result.filename} className="result-preview" />
          </div>
          <div className="result-info">
            <span className="result-name">{result.filename}</span>
            <span className="result-meta">
              {formatFileSize(result.size)}
              {result.originalSize && (
                <span className={"size-diff" + (result.size < result.originalSize ? " smaller" : " larger")}>
                  {result.size < result.originalSize
                    ? " ↓ " + Math.round((1 - result.size / result.originalSize) * 100) + "% menor"
                    : " ↑ " + Math.round((result.size / result.originalSize - 1) * 100) + "% maior"}
                </span>
              )}
            </span>
          </div>
          <button className="download-btn" onClick={handleDownload}>↓</button>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [files, setFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState("image/png");
  const [quality, setQuality] = useState(0.92);
  const [results, setResults] = useState([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter(f => f.type.startsWith("image/") || f.name.endsWith(".ico") || f.name.endsWith(".tif") || f.name.endsWith(".tiff"));
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name + f.size));
      return [...prev, ...valid.filter(f => !names.has(f.name + f.size))];
    });
    setResults([]);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResults([]);
  };

  const handleConvert = async () => {
    if (!files.length) return;
    setConverting(true);
    setResults([]);
    setProgress(0);

    const fmt = getFormatById(targetFormat);
    const out = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const filename = baseName + "." + fmt.ext;
      try {
        const blob = await convertImage(file, targetFormat, quality);
        const url = URL.createObjectURL(blob);
        out.push({ url, filename, size: blob.size, originalSize: file.size, original: file.name });
      } catch (e) {
        out.push({ error: e.message, original: file.name, filename });
      }
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setResults(out);
    setConverting(false);
  };

  const downloadAll = () => {
    results.filter(r => !r.error).forEach(r => {
      const a = document.createElement("a");
      a.href = r.url;
      a.download = r.filename;
      a.click();
    });
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setProgress(0);
  };

  const successCount = results.filter(r => !r.error).length;
  const noTransparencyFormats = ["image/jpeg", "image/bmp", "image/tiff"];

  return (
    <div className="app">
      <div className="noise" />
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">img<em>conv</em></span>
          </div>
          <p className="tagline">Converta imagens no navegador · sem upload · sem servidor</p>
        </div>
      </header>

      <main className="main">
        {/* Drop zone */}
        <div
          className={"drop-zone" + (dragging ? " dragging" : "") + (files.length ? " has-files" : "")}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !files.length && fileInputRef.current?.click()}
        >
          {files.length === 0 ? (
            <div className="drop-content">
              <div className="drop-icon">⬡</div>
              <p className="drop-title">Arraste imagens aqui</p>
              <p className="drop-sub">ou clique para selecionar</p>
              <p className="drop-formats">JPG · PNG · WEBP · GIF · BMP · TIFF · ICO · SVG</p>
            </div>
          ) : (
            <div className="file-list">
              {files.map((f, i) => (
                <FileCard key={f.name + f.size} file={f} onRemove={removeFile} index={i} />
              ))}
              <button className="add-more-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                + Adicionar mais
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={INPUT_ACCEPT}
          multiple
          style={{ display: "none" }}
          onChange={(e) => addFiles(e.target.files)}
        />

        {/* Controls */}
        {files.length > 0 && (
          <div className="card controls-card">
            <div className="controls-row">
              <div className="control-group">
                <label className="field-label">Converter para</label>
                <div className="format-grid">
                  {FORMATS.map(f => (
                    <button
                      key={f.id}
                      className={"format-btn" + (targetFormat === f.id ? " active" : "")}
                      onClick={() => setTargetFormat(f.id)}
                    >
                      <span className="format-ext">{f.label}</span>
                      <span className="format-note">{f.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-group quality-group">
                <label className="field-label">Qualidade</label>
                <div className="quality-btns">
                  {QUALITY_OPTIONS.map(q => (
                    <button
                      key={q.value}
                      className={"quality-btn" + (quality === q.value ? " active" : "")}
                      onClick={() => setQuality(q.value)}
                      disabled={targetFormat === "image/png" || targetFormat === "ico" || targetFormat === "image/svg+xml"}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
                {noTransparencyFormats.includes(targetFormat) && (
                  <p className="format-warn">⚠ Este formato não suporta transparência — será substituída por branco.</p>
                )}
              </div>
            </div>

            <div className="actions-row">
              <button className="convert-btn" onClick={handleConvert} disabled={converting}>
                {converting ? (
                  <><span className="spinner" /> Convertendo {progress}%</>
                ) : (
                  <>⬡ Converter {files.length} {files.length === 1 ? "imagem" : "imagens"}</>
                )}
              </button>
              <button className="clear-btn" onClick={clearAll}>Limpar</button>
            </div>

            {converting && (
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{ width: progress + "%" }} />
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="card results-card">
            <div className="results-header">
              <span className="results-title">
                ✓ {successCount} de {results.length} convertidas
              </span>
              {successCount > 1 && (
                <button className="download-all-btn" onClick={downloadAll}>
                  ↓ Baixar todas
                </button>
              )}
            </div>
            <div className="results-list">
              {results.map((r, i) => (
                <ResultCard key={i} result={r} index={i} />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <span>⬡ imgconv · Phanter AI · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
