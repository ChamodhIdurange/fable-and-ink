// Presentation constants for Fable & Ink. Story CONTENT (stories, chapters,
// scenes, forks, profiles) now comes from the backend API — this file only
// holds static UI vocabulary: genre lists, colors, and option definitions.

export const speeds = [0.75, 1, 1.25, 1.5]

export const genreOptions = ['All', 'Mystery', 'Sci-fi', 'Fantasy', 'Romance', 'YA']

export const pubGenreOptions = [
  'Literary', 'Mystery', 'Romance', 'Fantasy', 'Sci-fi', 'YA', 'Horror', 'Short fiction',
]

export const genreColors = {
  Mystery: '#3b82d4',
  'Sci-fi': '#00b8c8',
  Fantasy: '#9b3fb8',
  Romance: '#d44f78',
  YA: '#e8822a',
  Literary: '#4eb86a',
  Horror: '#b73030',
  'Short fiction': '#00b8c8',
}

export const genreCounts = {
  Literary: '2.4k',
  Mystery: '3.1k',
  Romance: '5.6k',
  Fantasy: '4.8k',
  'Sci-fi': '2.9k',
  YA: '3.7k',
  Horror: '1.2k',
  'Short fiction': '6.3k',
}

export const forkKindDefs = [
  { id: 'ending', title: 'Alternate ending', desc: 'Keep the story, change where it lands.' },
  { id: 'branch', title: 'New branch', desc: 'Diverge from a chapter of your choosing.' },
  { id: 'spinoff', title: 'Spin-off', desc: 'Same world, your own story.' },
]

export const visOptionDefs = [
  { id: 'public', title: 'Public', desc: 'Anyone can read, listen and fork.' },
  { id: 'unlisted', title: 'Unlisted', desc: 'Only people with the link. Hidden from Discover.' },
  { id: 'private', title: 'Private', desc: 'Only you. Stays in drafts.' },
]

export const genreColor = (g) => genreColors[g] || 'var(--nxb-text-muted)'
