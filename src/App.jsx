import { useState, useEffect } from 'react'
import AchievementList from './components/AchievementList'
import achievementsData from './data/achievements.json'
import styles from './styles/App.module.css'

function App() {
  const [achievements, setAchievements] = useState([])

  // Load achievements and restore completed state from localStorage
  useEffect(() => {
    const savedCompletedIds = localStorage.getItem('completedAchievements')
    const completedIds = savedCompletedIds ? JSON.parse(savedCompletedIds) : []

    const loaded = achievementsData.map((achievement) => ({
      ...achievement,
      completed: completedIds.includes(achievement.id),
    }))

    setAchievements(loaded)
  }, [])

  // Handle achievement toggle
  const handleToggleAchievement = (id) => {
    setAchievements((prev) => {
      const updated = prev.map((achievement) =>
        achievement.id === id
          ? { ...achievement, completed: !achievement.completed }
          : achievement
      )

      // Save completed state to localStorage
      const completedIds = updated
        .filter((achievement) => achievement.completed)
        .map((achievement) => achievement.id)
      localStorage.setItem('completedAchievements', JSON.stringify(completedIds))

      return updated
    })
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Limbus Company Achievement Tracker</h1>
        <p>Track your progress across all achievements</p>
      </header>
      <AchievementList achievements={achievements} onToggle={handleToggleAchievement} />
    </div>
  )
}

export default App
