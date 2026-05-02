import AchievementItem from './AchievementItem';
import styles from '../styles/AchievementList.module.css';

export default function AchievementList({ achievements, onToggle, onEdit, onDelete, baseAchievementIds }) {
  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {achievements.map((achievement) => (
          <AchievementItem
            key={achievement.id}
            achievement={achievement}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            isCustom={!baseAchievementIds?.includes(achievement.id)}
          />
        ))}
      </div>
    </div>
  );
}
