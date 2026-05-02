# LIMBUS COMPANY BUS ADVERSITY DEPARTMENT

An achievement tracker for the Mirror Dungeon in **Limbus Company**. This web app was created as a project for my web development course.

## Features

### Achievement Tracking
- Track your achievements on your browser's local storage (persisted across sessions)
- Manually mark achievements as completed
- Includes every achievement from the current Mirror Dungeon (Mirror of Names and Spiders)
- Regular updates planned with each new batch of achievements

### Custom Achievements
- Add your own custom achievements through simple JSON entry or file import
- Edit and delete custom achievements at any time
- Custom achievements are saved locally in your browser

### User Interface
- **Dark/Light Mode Toggle**: Switch between themes to match your preference
- **Advanced Filtering**: 
  - Filter by achievement group/category
  - Filter by projection rate
  - View completed vs. incomplete achievements
  - Multiple sort options (alphabetical, completion rate, etc.)
- **Search Functionality**: Quickly find specific achievements by name

### Data Management
- All data saved locally in browser storage (no server required)
- No account or login needed
- Your progress is tied to your browser/device
- Easy import/export capabilities for custom achievements

## Technical Stack

**Built With:**
- React 18 - UI framework
- Vite - Build tool and dev server
- CSS Modules - Scoped styling system
- ES6+ JavaScript

**Design Technologies:**
- Responsive CSS with media queries
- Flexbox and CSS Grid layouts
- CSS backdrop filters for visual effects

## Storage Information

**Note:** Since Limbus Company doesn't provide direct API access to achievement data, this tracker requires manual marking of completed achievements. I don't have a way to automatically sync with your in-game progress.

All data is stored locally in your browser:
- Completed achievement status
- Custom achievements
- Theme preference (dark/light mode)

## Tools & Resources Used

**Development:**
- GitHub Copilot - AI assistance for code development and optimization
- VS Code - Code editor
- Node.js & npm - Package management

**Design & Assets:**
- Custom fonts: Mikodacs (title), Pretendard (content)
- Background images from Limbus Company assets
- SVG icons for UI elements

## AI Disclaimer

This project was developed with assistance from **GitHub Copilot**, an AI-powered code completion and generation tool. Copilot was used to:
- Generate component code and boilerplate
- Optimize CSS and responsive design patterns
- Assist with state management logic
- Suggest improvements to code structure

While AI assistance was utilized, all core functionality, design decisions, and project architecture were directed and validated by the developer.

## Notes

- I will try my best to update it with each new batch of achievements
- This tracker is fan-made and not affiliated with Project Moon
- Data is stored locally: clearing your browser data will reset your progress!!!
