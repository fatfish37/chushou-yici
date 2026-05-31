import { useState } from "react";

export default function ActionCard({ items }) {
  const [copied, setCopied] = useState("");

  async function copyText(item) {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopied(item.label);
      window.setTimeout(() => setCopied(""), 1400);
    } catch {
      setCopied("复制失败");
    }
  }

  return (
    <div className="cardStack">
      {items.map((item) => (
        <article className="actionCard" key={item.label}>
          <div className="cardTop">
            <h3>{item.label}</h3>
            <button className="ghostButton" onClick={() => copyText(item)}>
              {copied === item.label ? "已复制" : "复制"}
            </button>
          </div>
          <p>{item.text}</p>
        </article>
      ))}
      {copied === "复制失败" && <p className="inlineError">复制失败。</p>}
    </div>
  );
}
