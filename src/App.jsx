import { useState, useEffect } from 'react'
import AchievementList from './components/AchievementList'
import FilterPanel from './components/FilterPanel'
import achievementsData from './data/achievements.json'
import styles from './styles/App.module.css'

function App() {
  const [achievements, setAchievements] = useState([])
  const [filteredAchievements, setFilteredAchievements] = useState([])

  // Load achievements and restore completed state from localStorage
  useEffect(() => {
    const savedCompletedIds = localStorage.getItem('completedAchievements')
    const completedIds = savedCompletedIds ? JSON.parse(savedCompletedIds) : []

    const loaded = achievementsData.map((achievement) => ({
      ...achievement,
      completed: completedIds.includes(achievement.id),
    }))

    setAchievements(loaded)
    setFilteredAchievements(loaded)
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

  // Handle filter changes
  const handleFilterChange = (filtered) => {
    setFilteredAchievements(filtered)
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Limbus Company Achievement Tracker</h1>
        <p>Track your progress across all achievements</p>
      </header>
      {achievements.length > 0 && (
        <FilterPanel achievements={achievements} onFilterChange={handleFilterChange} />
      )}
      <AchievementList achievements={filteredAchievements} onToggle={handleToggleAchievement} />
    </div>
  )
}

export default App
