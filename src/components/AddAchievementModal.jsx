import { useState } from 'react';
import styles from '../styles/Modal.module.css';

const EXAMPLE_ACHIEVEMENTS = [
  {
    id: 9999,
    name: "Finish a Mirror Dungeon run without taking any damage",
    keywords: ["custom", "damage", "hp"]
  },
  {
    name: "Finish a Mirror Dungeon run without using any E.G.O. skills",
    group: "Challenge",
    keywords: ["challenge", "ego", "skills"]
  }
];

export default function AddAchievementModal({ isOpen, onClose, onAdd, maxId, darkMode }) {
  const [jsonText, setJsonText] = useState(JSON.stringify(EXAMPLE_ACHIEVEMENTS, null, 2));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const parsed = JSON.parse(content);
        setJsonText(JSON.stringify(parsed, null, 2));
        setError('');
      } catch (err) {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleAddAchievements = () => {
    setError('');
    setSuccess('');

    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setError('JSON must be an array of achievements');
        return;
      }

      // Validate each achievement
      const validated = parsed.map((ach, idx) => {
        if (!ach.name) {
          throw new Error(`Achievement ${idx + 1}: Missing required field (name)`);
        }
        if (!Array.isArray(ach.keywords)) {
          throw new Error(`Achievement ${idx + 1}: keywords must be an array`);
        }

        return {
          id: (ach.id || maxId + idx + 1),
          name: ach.name,
          projectionRate: ach.projectionRate ?? 0,
          group: ach.group || 'Custom',
          keywords: ach.keywords,
          completed: false,
        };
      });

      onAdd(validated);
      setSuccess(`Added ${validated.length} achievement(s)!`);
      setTimeout(() => {
        onClose();
        setJsonText(JSON.stringify(EXAMPLE_ACHIEVEMENTS, null, 2));
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} ${darkMode ? styles.darkMode : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add Custom Achievements</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.section}>
            <h3>Paste JSON</h3>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className={styles.jsonTextarea}
              placeholder="Paste JSON array of achievements here..."
            />
          </div>

          <div className={styles.section}>
            <h3>Or Import File</h3>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className={styles.fileInput}
            />
          </div>

          <div className={styles.section}>
            <h3>Schema</h3>
            <pre className={styles.schema}>{`{
  "id": 1,              // optional, auto-generated if missing
  "name": "string",     // required
  "projectionRate": 25, // optional, defaults to 0
  "group": "string",    // optional, defaults to "Custom"
  "keywords": ["str"]   // required array
}`}</pre>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.submitButton} onClick={handleAddAchievements}>
            Add Achievements
          </button>
        </div>
      </div>
    </div>
  );
}
