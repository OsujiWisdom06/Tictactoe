/* eslint-disable react/prop-types */
import { useEffect} from "react";

export default function ThemeMode({ darkMode, setDarkMode }) {


  useEffect(() => {
    // made the body also adapt to the themeMode
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("ticTacToeDark", darkMode.toString());
  }, [darkMode]);

  return (
    <div className="dark-toggle">
      <label className="switch">
        <input
          type="checkbox"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
        />
        <span className="slider"></span>
      </label>
    </div>
  );
}
