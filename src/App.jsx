import { useState, useEffect, useCallback } from 'react'
import AchievementList from './components/AchievementList'
import FilterPanel from './components/FilterPanel'
import AddAchievementModal from './components/AddAchievementModal'
import EditAchievementModal from './components/EditAchievementModal'
import { achievementsApi } from './api/client'
import styles from './styles/App.module.css'

function App() {
  const [backgroundImage] = useState(() => {
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
    return `${import.meta.env.BASE_URL}backgrounds/${randomBg}`
  })
  const [achievements, setAchievements] = useState([])
  const [filteredAchievements, setFilteredAchievements] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState(null)
  const [darkMode, setDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshAchievements = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const loaded = await achievementsApi.listAll(250)
      setAchievements(loaded)
      setFilteredAchievements(loaded)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load achievements')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadInitialAchievements = async () => {
      setError('')
      try {
        const loaded = await achievementsApi.listAll(250)
        if (cancelled) {
          return
        }

        setAchievements(loaded)
        setFilteredAchievements(loaded)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load achievements')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadInitialAchievements()

    return () => {
      cancelled = true
    }
  }, [])

  // Handle achievement toggle
  const handleToggleAchievement = useCallback(async (id) => {
    const current = achievements.find((achievement) => achievement.id === id)
    if (!current) {
      return
    }

    setError('')
    try {
      const updated = await achievementsApi.update(id, {
        completed: !current.completed,
      })

      setAchievements((prev) =>
        prev.map((achievement) => (achievement.id === id ? updated : achievement))
      )
      setFilteredAchievements((prev) =>
        prev.map((achievement) => (achievement.id === id ? updated : achievement))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update achievement')
    }
  }, [achievements])

  // Handle filter changes
  const handleFilterChange = useCallback((filtered) => {
    setFilteredAchievements(filtered)
  }, [])

  // Handle adding custom achievements
  const handleAddAchievements = useCallback(async (newAchievements) => {
    setError('')
    try {
      await Promise.all(
        newAchievements.map((achievement) => {
          return achievementsApi.create({
            ...achievement,
            source: 'custom',
          })
        })
      )
      await refreshAchievements()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add achievements')
      throw err
    }
  }, [refreshAchievements])

  // Handle updating custom achievement
  const handleUpdateAchievement = useCallback(async (updated) => {
    setError('')
    try {
      const saved = await achievementsApi.update(updated.id, {
        name: updated.name,
        projectionRate: updated.projectionRate,
        group: updated.group,
        keywords: updated.keywords,
        source: updated.source,
      })

      setAchievements((prev) =>
        prev.map((achievement) => (achievement.id === saved.id ? saved : achievement))
      )
      setFilteredAchievements((prev) =>
        prev.map((achievement) => (achievement.id === saved.id ? saved : achievement))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update achievement')
      throw err
    }
  }, [])

  // Handle deleting custom achievement
  const handleDeleteAchievement = useCallback(async (id) => {
    setError('')
    try {
      await achievementsApi.remove(id)
      setAchievements((prev) => prev.filter((achievement) => achievement.id !== id))
      setFilteredAchievements((prev) => prev.filter((achievement) => achievement.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete achievement')
      throw err
    }
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
              <img src={`${import.meta.env.BASE_URL}lcba_logo.png`} alt="LCBA Logo" className={styles.logo} />
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
                <img src={darkMode ? `${import.meta.env.BASE_URL}moon.svg` : `${import.meta.env.BASE_URL}sun.svg`} alt={darkMode ? "Moon" : "Sun"} />
              </button>
            </div>
          </div>
        </header>
        <div className={styles.contentLayoutWrapper}>
          <div className={styles.contentMain}>
            {error && <p style={{ color: '#ff8080' }}>{error}</p>}
            {loading && <p>Loading achievements...</p>}
            <AchievementList 
              achievements={filteredAchievements} 
              onToggle={handleToggleAchievement}
              onEdit={(ach) => {
                setEditingAchievement(ach)
                setEditModalOpen(true)
              }}
              onDelete={handleDeleteAchievement}
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
        darkMode={darkMode}
      />
      {editingAchievement && (
        <EditAchievementModal
          key={editingAchievement.id}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setEditingAchievement(null)
          }}
          onUpdate={handleUpdateAchievement}
          onDelete={handleDeleteAchievement}
          achievement={editingAchievement}
          isCustom={editingAchievement.source === 'custom'}
          darkMode={darkMode}
        />
      )}
      </div>
    </div>
  )
}

export default App
