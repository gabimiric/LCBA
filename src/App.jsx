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
  const [darkMode, setDarkMode] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Select random background on mount
  useEffect(() => {
    const backgrounds = [
      'S912.png',
      'S933.png',
      'S942_7.png',
      'S949.png',
      'story_9_laboratory.png',
      'story_bulkhead_ev_v2.png',
      'story_collapsed corridor.png',
      'story_house_spiders_rooftop_ashes.png',
      'story__command_broadcast_entrance.png',
      'story__command_broadcast_hallway_close.png',
    ]
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)]
    setBackgroundImage(`/backgrounds/${randomBg}`)
  }, [])

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
    <div 
      className={`${styles.app} ${darkMode ? styles.darkMode : ''}`}
      style={{
        backgroundImage: `url('${backgroundImage}')`,
      }}
    >
      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <img src="/lcba_logo.png" alt="LCBA Logo" className={styles.logo} />
              <div className={styles.headerText}>
                <h1 className={styles.title}>LIMBUS COMPANY BUS ADVERSITY</h1>
                <p className={styles.description}>A Limbus Company Mirror Dungeon Achievement Tracker</p>
              </div>
            </div>
            <div className={styles.headerRight}>
              <button 
                className={styles.addButton}
                onClick={() => setModalOpen(true)}
                title="Add Achievements"
              >
                +
              </button>
              <button 
                className={styles.themeToggle}
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? "Light mode" : "Dark mode"}
              >
                <img src={darkMode ? "/moon.svg" : "/sun.svg"} alt={darkMode ? "Moon" : "Sun"} />
              </button>
            </div>
          </div>
        </header>
        <div className={styles.contentLayoutWrapper}>
          <div className={styles.contentMain}>
            <AchievementList 
              achievements={filteredAchievements} 
              onToggle={handleToggleAchievement}
              onEdit={(ach) => {
                setEditingAchievement(ach)
                setEditModalOpen(true)
              }}
              onDelete={handleDeleteAchievement}
              baseAchievementIds={achievementsData.map((a) => a.id)}
              darkMode={darkMode}
            />
          </div>
          <div className={`${styles.contentSidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`} onClick={(e) => e.stopPropagation()}>
            {achievements.length > 0 && (
              <FilterPanel achievements={achievements} onFilterChange={handleFilterChange} darkMode={darkMode} onClose={() => setSidebarOpen(false)} />
            )}
          </div>
          <button 
            className={`${styles.sidebarToggleButton} ${sidebarOpen ? styles.sidebarOpen : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            title="Toggle filters"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="10" r="7" />
              <line x1="17" y1="17" x2="24" y2="24" />
            </svg>
          </button>
        </div>
      <AddAchievementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddAchievements}
        maxId={Math.max(...achievements.map((a) => a.id), 0)}
        darkMode={darkMode}
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
          darkMode={darkMode}
        />
      )}
      </div>
    </div>
  )
}

export default App
