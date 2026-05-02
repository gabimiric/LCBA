import { useState } from 'react';
import styles from '../styles/AchievementItem.module.css';

export default function AchievementItem({ achievement, onToggle, onEdit, onDelete, isCustom }) {
  const [keywordsExpanded, setKeywordsExpanded] = useState(false);

  const handleToggle = () => {
    onToggle(achievement.id);
  };

  const isHidden = achievement.group === 'Hidden';
  const isCompletionist = achievement.group === 'Completionist';
  const hasProjection = achievement.projectionRate > 0;
  const projectionImage = isCompletionist ? '/banner_item.png' : (isHidden ? '/lunacy.png' : '/spider_projection.png');

  return (
    <div className={`${styles.item} ${achievement.completed ? styles.completed : ''}`}>
      <div className={styles.backgroundImage}></div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{achievement.name}</h3>
          <span className={`${styles.badge} ${styles[achievement.group.toLowerCase().replace(/\s+/g, '-')]}`}>
            {achievement.group}
          </span>
        </div>
        {isCustom && (
          <div className={styles.actions}>
            <button className={styles.editBtn} onClick={() => onEdit(achievement)}>
              Edit
            </button>
            <button className={styles.deleteBtn} onClick={() => onDelete(achievement.id)}>
              Delete
            </button>
          </div>
        )}
        <button
          className={styles.keywordsToggle}
          onClick={() => setKeywordsExpanded(!keywordsExpanded)}
        >
          Keywords {keywordsExpanded ? '▼' : '▶'}
        </button>
        {keywordsExpanded && (
          <div className={styles.keywords}>
            {achievement.keywords.map((keyword) => (
              <span key={keyword} className={styles.keyword}>
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {(hasProjection || isCustom || isCompletionist) && (
        <div className={styles.cornerContainer}>
          <button
            className={`${styles.toggleButton} ${achievement.completed ? styles.completedButton : ''}`}
            onClick={handleToggle}
            title={achievement.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {!isCustom ? (
              <>
                <img 
                  src={projectionImage}
                  alt={isCompletionist ? 'Banner' : (isHidden ? 'Lunacy' : 'Projection')}
                  className={styles.projectionImage}
                />
                {!isCompletionist && (
                  <div className={styles.xpDisplay}>
                    <span className={styles.xpValue}>
                      +{achievement.projectionRate}
                    </span>
                  </div>
                )}
              </>
            ) : null}
          </button>
        </div>
      )}
    </div>
  );
}
