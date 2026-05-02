import styles from '../styles/AchievementItem.module.css';

export default function AchievementItem({ achievement, onToggle }) {
  const handleToggle = () => {
    onToggle(achievement.id);
  };

  const isHidden = achievement.group === 'Hidden';
  const projectionImage = isHidden ? '/lunacy.png' : '/spider_projection.png';

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
        <div className={styles.keywords}>
          {achievement.keywords.map((keyword) => (
            <span key={keyword} className={styles.keyword}>
              {keyword}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.cornerContainer}>
        <button
          className={`${styles.toggleButton} ${achievement.completed ? styles.completedButton : ''}`}
          onClick={handleToggle}
          title={achievement.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <img 
            src={projectionImage}
            alt={isHidden ? 'Lunacy' : 'Projection'}
            className={styles.projectionImage}
          />
          <div className={styles.xpDisplay}>
            <span className={styles.xpValue}>
              {isHidden ? 'Lunacy' : `+${achievement.projectionRate}`}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
