// src/components/LanguageSwitcher.tsx
import React from "react";
import i18n from "../i18n";

const LanguageSwitcher: React.FC = () => {
  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      style={{
        padding: "6px 8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        cursor: "pointer"
      }}
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
};

export default LanguageSwitcher;
