import { useRef, useState } from "react";

export default function DataPanel({ data, onImport, onClear }) {
  const fileRef = useRef(null);
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chushou-yici-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("已导出 JSON。");
  }

  async function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      onImport(text);
      setMessage("已导入 JSON。");
    } catch (error) {
      setMessage(error.message || "导入失败。");
    } finally {
      event.target.value = "";
    }
  }

  function clearAll() {
    if (!confirming) {
      setConfirming(true);
      setMessage("再点一次确认清空。");
      return;
    }
    onClear();
    setConfirming(false);
    setMessage("已清空。");
  }

  return (
    <section className="dataPanel">
      <div>
        <p className="eyebrow">数据</p>
        <p>
          当前是网页内测版：不需要注册，不会上传你的记录。数据只保存在当前浏览器
          localStorage。换设备、换浏览器、清理浏览器数据后，记录可能丢失。建议定期使用“导出
          JSON”备份。
        </p>
      </div>

      <div className="dataActions">
        <button className="primaryButton" onClick={exportJson}>
          导出 JSON
        </button>
        <button
          className="secondaryButton"
          onClick={() => fileRef.current?.click()}
        >
          导入 JSON
        </button>
        <button
          className={`dangerButton ${confirming ? "dangerConfirm" : ""}`}
          onClick={clearAll}
        >
          {confirming ? "确认清空全部记录" : "清空数据"}
        </button>
        <input
          ref={fileRef}
          className="hiddenInput"
          type="file"
          accept="application/json,.json"
          onChange={importJson}
        />
      </div>
      {message && <p className="dataMessage">{message}</p>}
    </section>
  );
}
