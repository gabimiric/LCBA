import styles from '../styles/AchievementItem.module.css';

export default function AchievementItem({ achievement, onToggle }) {
  const handleToggle = () => {
    onToggle(achievement.id);
  };

  return (
    <div className={`${styles.item} ${achievement.completed ? styles.completed : ''}`}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{achievement.name}</h3>
          <span className={`${styles.badge} ${styles[achievement.group.toLowerCase().replace(/\s+/g, '-')]}`}>
            {achievement.group}
          </span>
        </div>
        <div className={styles.details}>
          <span className={styles.xp}>+{achievement.projectionRate} XP</span>
          <div className={styles.keywords}>
            {achievement.keywords.map((keyword) => (
              <span key={keyword} className={styles.keyword}>
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
      <button
        className={styles.toggle}
        onClick={handleToggle}
        title={achievement.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {achievement.completed ? '✓' : '○'}
      </button>
    </div>
  );
}
