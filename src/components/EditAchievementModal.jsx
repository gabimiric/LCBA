import { useState } from 'react';
import styles from '../styles/Modal.module.css';

export default function EditAchievementModal({
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  achievement,
  isCustom,
  darkMode,
}) {
  const [jsonText, setJsonText] = useState(
    JSON.stringify(achievement, null, 2)
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdate = () => {
    setError('');
    setSuccess('');

    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.name || !parsed.group) {
        setError('Achievement must have name and group');
        return;
      }
      if (!Array.isArray(parsed.keywords)) {
        setError('Keywords must be an array');
        return;
      }

      const updated = {
        ...parsed,
        id: achievement.id,
        projectionRate: parsed.projectionRate ?? 0,
        completed: achievement.completed,
      };

      onUpdate(updated);
      setSuccess('Achievement updated!');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${achievement.name}"?`
      )
    ) {
      onDelete(achievement.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} ${darkMode ? styles.darkMode : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Edit Achievement</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.section}>
            <h3>Edit JSON</h3>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className={styles.jsonTextarea}
              placeholder="Edit achievement JSON..."
            />
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}
        </div>

        <div className={styles.modalFooter}>
          {isCustom && (
            <button className={styles.deleteButton} onClick={handleDelete}>
              Delete
            </button>
          )}
          <div style={{ flex: 1 }}></div>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.submitButton} onClick={handleUpdate}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
