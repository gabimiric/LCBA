import { useState, useEffect, useCallback } from 'react'
import AchievementList from './components/AchievementList'
import FilterPanel from './components/FilterPanel'
import AddAchievementModal from './components/AddAchievementModal'
import EditAchievementModal from './components/EditAchievementModal'
import achievementsData from './data/achievements.json'
import styles from './styles/App.module.css'

function App() {
  const [achievements, setAchievements] = useState([])
  const [filteredAchievements, setFilteredAchievements] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState(null)

  // Load achievements and restore completed state from localStorage
  useEffect(() => {
    const savedCompletedIds = localStorage.getItem('completedAchievements')
    const completedIds = savedCompletedIds ? JSON.parse(savedCompletedIds) : []

    // Load custom achievements
    const savedCustomAchievements = localStorage.getItem('customAchievements')
    const customAchievements = savedCustomAchievements ? JSON.parse(savedCustomAchievements) : []

    // Combine base achievements with custom ones
    const allAchievements = [...achievementsData, ...customAchievements]

    const loaded = allAchievements.map((achievement) => ({
      ...achievement,
      completed: completedIds.includes(achievement.id),
    }))

    setAchievements(loaded)
    setFilteredAchievements(loaded)
  }, [])

  // Handle achievement toggle
  const handleToggleAchievement = useCallback((id) => {
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
  }, [])

  // Handle filter changes
  const handleFilterChange = useCallback((filtered) => {
    setFilteredAchievements(filtered)
  }, [])

  // Handle adding custom achievements
  const handleAddAchievements = useCallback((newAchievements) => {
    setAchievements((prev) => {
      const updated = [...prev, ...newAchievements]
      
      // Save custom achievements to localStorage
      const customAchievements = updated.filter(
        (ach) => !achievementsData.some((base) => base.id === ach.id)
      )
      localStorage.setItem('customAchievements', JSON.stringify(customAchievements))
      
      return updated
    })
  }, [])

  // Handle updating custom achievement
  const handleUpdateAchievement = useCallback((updated) => {
    setAchievements((prev) => {
      const result = prev.map((ach) => (ach.id === updated.id ? updated : ach))
      
      // Save custom achievements to localStorage
      const customAchievements = result.filter(
        (ach) => !achievementsData.some((base) => base.id === ach.id)
      )
      localStorage.setItem('customAchievements', JSON.stringify(customAchievements))
      
      return result
    })
  }, [])

  // Handle deleting custom achievement
  const handleDeleteAchievement = useCallback((id) => {
    setAchievements((prev) => {
      const result = prev.filter((ach) => ach.id !== id)
      
      // Save custom achievements to localStorage
      const customAchievements = result.filter(
        (ach) => !achievementsData.some((base) => base.id === ach.id)
      )
      localStorage.setItem('customAchievements', JSON.stringify(customAchievements))
      
      return result
    })
  }, [])

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>Limbus Company Achievement Tracker</h1>
            <p>Track your progress across all achievements</p>
          </div>
          <button className={styles.addButton} onClick={() => setModalOpen(true)}>
            + Add Achievements
          </button>
        </div>
      </header>
      {achievements.length > 0 && (
        <FilterPanel achievements={achievements} onFilterChange={handleFilterChange} />
      )}
      <AchievementList 
        achievements={filteredAchievements} 
        onToggle={handleToggleAchievement}
        onEdit={(ach) => {
          setEditingAchievement(ach)
          setEditModalOpen(true)
        }}
        onDelete={handleDeleteAchievement}
        baseAchievementIds={achievementsData.map((a) => a.id)}
      />
      <AddAchievementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddAchievements}
        maxId={Math.max(...achievements.map((a) => a.id), 0)}
      />
      {editingAchievement && (
        <EditAchievementModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setEditingAchievement(null)
          }}
          onUpdate={handleUpdateAchievement}
          onDelete={handleDeleteAchievement}
          achievement={editingAchievement}
          isCustom={!achievementsData.some((a) => a.id === editingAchievement.id)}
        />
      )}
    </div>
  )
}

export default App
