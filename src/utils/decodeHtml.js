// utils/decodeHtml.js
export default function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    const firstPass = txt.value;
  
    txt.innerHTML = firstPass;
    return txt.value;
  }
  