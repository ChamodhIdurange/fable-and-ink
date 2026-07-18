import { useEffect, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import Home from './screens/Home.jsx'
import Discover from './screens/Discover.jsx'
import Reader from './screens/Reader.jsx'
import Editor from './screens/Editor.jsx'
import Publish from './screens/Publish.jsx'
import Profile from './screens/Profile.jsx'
import MobileReader from './screens/MobileReader.jsx'
import { IconGitFork, IconCheck, IconX } from './components/Icon.jsx'
import { forkKindDefs, genreOptions, speeds } from './data.js'
import { api, getToken, setToken } from './api.js'

export default function App() {
  // ---- session + remote data ----
  const [currentUser, setCurrentUser] = useState(null)
  const [samples, setSamples] = useState([]) // Home "fresh off the press"
  const [feed, setFeed] = useState([]) // Discover feed (respects genre + blind)
  const [continueReading, setContinueReading] = useState(null)
  const [currentStory, setCurrentStory] = useState(null)
  const [tree, setTree] = useState(null)
  const [draft, setDraft] = useState(null)
  const [profile, setProfile] = useState(null)
  const [healthNotes, setHealthNotes] = useState([])

  // ---- UI state ----
  const [screen, setScreen] = useState('home')
  const [dark, setDark] = useState(false)
  const [blindRead, setBlindRead] = useState(false)
  const [genreFilter, setGenreFilter] = useState('All')

  const [readerFs, setReaderFs] = useState(18)
  const [chapter, setChapterIdx] = useState(0)
  const [chaptersOpen, setChaptersOpen] = useState(false)
  const [treeOpen, setTreeOpen] = useState(false)

  const [listenOpen, setListenOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [speedIdx, setSpeedIdx] = useState(1)

  const [forkModalOpen, setForkModalOpen] = useState(false)
  const [forkKind, setForkKind] = useState('ending')

  const [tab, setTab] = useState('write')
  const [healthOpen, setHealthOpen] = useState(true)
  const [beautifyOpen, setBeautifyOpen] = useState(false)
  const [highlightScene, setHighlightScene] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [dragId, setDragId] = useState(null)

  const [pubTitle, setPubTitle] = useState('')
  const [pubBlurb, setPubBlurb] = useState('')
  const [pubGenresSel, setPubGenresSel] = useState([])
  const [visibility, setVisibility] = useState('public')

  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  // ---- theme ----
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // ---- bootstrap: demo login, then load the shelf + reading position ----
  useEffect(() => {
    ;(async () => {
      try {
        if (!getToken()) {
          const { token, user } = await api.demoLogin()
          setToken(token)
          setCurrentUser(user)
        } else {
          const { user } = await api.me()
          setCurrentUser(user)
        }
        const [s, p] = await Promise.all([api.feed({ genre: 'All', blind: false }), api.progress()])
        setSamples(s.stories)
        setContinueReading(p.progress)
      } catch (err) {
        console.error('Bootstrap failed:', err)
        showToast('Could not reach the API — is the server running?')
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Discover feed reacts to genre + blind ----
  useEffect(() => {
    if (!currentUser) return
    let cancelled = false
    api
      .feed({ genre: genreFilter, blind: blindRead })
      .then((r) => !cancelled && setFeed(r.stories))
      .catch((err) => console.error('Feed load failed:', err))
    return () => {
      cancelled = true
    }
  }, [currentUser, genreFilter, blindRead])

  // ---- audio playback loop ----
  const chapterRef = useRef(chapter)
  const speedRef = useRef(speedIdx)
  const storyRef = useRef(currentStory)
  chapterRef.current = chapter
  speedRef.current = speedIdx
  storyRef.current = currentStory
  useEffect(() => {
    if (!playing) return
    const iv = setInterval(() => {
      setProgress((p) => {
        const chs = storyRef.current?.chapters ?? []
        const dur = chs[chapterRef.current]?.secs ?? 300
        const next = p + 0.25 * speeds[speedRef.current]
        if (next >= dur) {
          setPlaying(false)
          return dur
        }
        return next
      })
    }, 250)
    return () => clearInterval(iv)
  }, [playing])

  // ---- helpers ----
  const showToast = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  const go = (next) => {
    setPlaying(false)
    setScreen(next)
    window.scrollTo(0, 0)
    if (next === 'editor') loadDraft()
    if (next === 'profile') loadProfile()
    if (next === 'mobile' && !currentStory && samples[0]) loadStory(samples[0].id)
  }

  async function loadStory(id, chapterIndex = 0) {
    try {
      const [{ story }, forks] = await Promise.all([api.story(id, { blind: blindRead }), api.forks(id)])
      setCurrentStory(story)
      setTree(forks)
      setChapterIdx(Math.min(chapterIndex, (story.chapters?.length ?? 1) - 1))
      setProgress(0)
      return story
    } catch (err) {
      console.error('Story load failed:', err)
      showToast('Could not open that story')
      return null
    }
  }

  const openStory = async (id, chapterIndex = 0) => {
    if (!id) return
    setChaptersOpen(false)
    setTreeOpen(false)
    setListenOpen(false)
    await loadStory(id, chapterIndex)
    go('reader')
  }

  async function loadDraft() {
    try {
      const { draft: d } = await api.draft()
      setDraft(d)
      if (d) {
        setPubTitle(d.title || '')
        setPubBlurb(d.blurb || '')
        setPubGenresSel(d.genres?.length ? d.genres : ['Literary'])
        setVisibility(d.visibility || 'public')
        const { notes } = await api.health(d.id)
        setHealthNotes(notes)
      }
    } catch (err) {
      console.error('Draft load failed:', err)
    }
  }

  async function loadProfile() {
    try {
      setProfile(await api.profile())
    } catch (err) {
      console.error('Profile load failed:', err)
    }
  }

  // ---- reader ----
  const setChapter = (i, opts = {}) => {
    setChapterIdx(i)
    setProgress(0)
    setPlaying(false)
    if (opts.fromList) setChaptersOpen(false)
    // Persist reading position so "Continue reading" reflects it.
    if (currentStory) {
      api
        .saveProgress(currentStory.id, i, 0)
        .then(() => api.progress())
        .then((p) => setContinueReading(p.progress))
        .catch(() => {})
    }
  }
  const toggleChapters = () => {
    setChaptersOpen((v) => !v)
    setTreeOpen(false)
  }
  const toggleTree = () => {
    setTreeOpen((v) => !v)
    setChaptersOpen(false)
  }

  // ---- audio controls ----
  const togglePlay = () => {
    if (playing) setPlaying(false)
    else {
      if (!listenOpen && screen === 'reader') setListenOpen(true)
      setPlaying(true)
    }
  }
  const seek = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const dur = currentStory?.chapters?.[chapter]?.secs ?? 300
    setProgress(dur * Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)))
  }

  // ---- fork ----
  const createFork = async () => {
    if (!currentStory) return
    setForkModalOpen(false)
    try {
      await api.createFork(currentStory.id, forkKind)
      await loadDraft()
      go('editor')
      showToast('Fork created in your drafts')
    } catch (err) {
      console.error('Fork failed:', err)
      showToast('Could not create fork')
    }
  }

  // ---- beautify (stubbed AI) ----
  const runBeautify = async () => {
    setTab('write')
    setBeautifyOpen(true)
    if (!draft) return
    try {
      const { suggestions: s } = await api.beautify(draft.draftBody)
      setSuggestions(s.map((x) => ({ ...x, status: 'pending' })))
    } catch (err) {
      console.error('Beautify failed:', err)
      showToast('Beautify is unavailable')
    }
  }

  const applyRevision = (text, s) => text.split(s.original).join(s.revised)
  const persistDraftBody = (body) => {
    if (draft) api.updateStory(draft.id, { draftBody: body }).catch(() => {})
  }
  const decide = (id, accepted) => {
    const s = suggestions.find((x) => x.id === id)
    setSuggestions((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: accepted ? 'accepted' : 'rejected' } : x)),
    )
    if (accepted && s && draft) {
      const body = applyRevision(draft.draftBody, s)
      setDraft({ ...draft, draftBody: body })
      persistDraftBody(body)
    }
  }
  const acceptAll = () => {
    if (!draft) return
    let body = draft.draftBody
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.status === 'pending') {
          body = applyRevision(body, s)
          return { ...s, status: 'accepted' }
        }
        return s
      }),
    )
    setDraft({ ...draft, draftBody: body })
    persistDraftBody(body)
    showToast('All suggestions applied — voice preserved')
  }
  const viewInArrange = (scene) => {
    setTab('arrange')
    setHighlightScene(scene)
  }

  // ---- editor draft text fields ----
  const onDraftBody = (e) => {
    const body = e.target.value
    setDraft((d) => (d ? { ...d, draftBody: body } : d))
  }
  const onChapterTitle = (e) => {
    const title = e.target.value
    setDraft((d) => (d ? { ...d, draftChapterTitle: title } : d))
  }
  // Persist editor text on blur-like cadence: debounce via a ref timer.
  const saveTimer = useRef(null)
  useEffect(() => {
    if (!draft || screen !== 'editor') return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      api
        .updateStory(draft.id, { draftBody: draft.draftBody, draftChapterTitle: draft.draftChapterTitle })
        .catch(() => {})
    }, 800)
    return () => clearTimeout(saveTimer.current)
  }, [draft?.draftBody, draft?.draftChapterTitle])

  // ---- arrange drag ----
  const drag = {
    start: (e, id) => {
      setDragId(id)
      setHighlightScene(null)
      e.dataTransfer.effectAllowed = 'move'
    },
    over: (e, id) => {
      e.preventDefault()
      setDraft((d) => {
        if (!d) return d
        const order = d.scenes.slice()
        const from = order.findIndex((s) => s.slug === dragId)
        const to = order.findIndex((s) => s.slug === id)
        if (from < 0 || to < 0 || from === to) return d
        const [moved] = order.splice(from, 1)
        order.splice(to, 0, moved)
        return { ...d, scenes: order }
      })
    },
    end: () => {
      setDragId(null)
      if (draft) api.reorderScenes(draft.id, draft.scenes.map((s) => s.slug)).catch(() => {})
    },
  }

  // ---- publish ----
  const toggleGenre = (g) => {
    setPubGenresSel((sel) => {
      const i = sel.indexOf(g)
      if (i >= 0) return sel.filter((x) => x !== g)
      if (sel.length < 2) return [...sel, g]
      return sel
    })
  }
  const doPublish = async () => {
    if (!draft) return
    try {
      await api.publish(draft.id, {
        title: pubTitle,
        blurb: pubBlurb,
        genres: pubGenresSel,
        visibility,
      })
      await Promise.all([loadProfile(), api.feed({ genre: 'All', blind: false }).then((r) => setSamples(r.stories))])
      go('profile')
      showToast('Published — live on Discover')
    } catch (err) {
      console.error('Publish failed:', err)
      showToast('Could not publish')
    }
  }

  const wordCount = (draft?.draftBody ?? '').trim().split(/\s+/).filter(Boolean).length.toLocaleString('en-US')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nxb-surface-1)', display: 'flex', flexDirection: 'column' }}>
      <Header screen={screen} dark={dark} go={go} toggleTheme={() => setDark((v) => !v)} user={currentUser} />

      {screen === 'home' && (
        <Home
          go={go}
          tryBlind={() => {
            setBlindRead(true)
            go('discover')
          }}
          openStory={openStory}
          pickCategory={(g) => {
            setGenreFilter(genreOptions.includes(g) ? g : 'All')
            go('discover')
          }}
          samples={samples}
        />
      )}

      {screen === 'discover' && (
        <Discover
          blindRead={blindRead}
          toggleBlind={() => setBlindRead((v) => !v)}
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
          openStory={openStory}
          stories={feed}
          progress={continueReading}
        />
      )}

      {screen === 'reader' && (
        <Reader
          go={go}
          story={currentStory}
          tree={tree}
          blindRead={blindRead}
          chapter={chapter}
          setChapter={setChapter}
          readerFs={readerFs}
          fontDown={() => setReaderFs((v) => Math.max(15, v - 1))}
          fontUp={() => setReaderFs((v) => Math.min(24, v + 1))}
          chaptersOpen={chaptersOpen}
          toggleChapters={toggleChapters}
          treeOpen={treeOpen}
          toggleTree={toggleTree}
          openFork={() => setForkModalOpen(true)}
          listenOpen={listenOpen}
          toggleListen={() => setListenOpen((v) => !v)}
          playing={playing}
          togglePlay={togglePlay}
          progress={progress}
          seek={seek}
          speedIdx={speedIdx}
          cycleSpeed={() => setSpeedIdx((v) => (v + 1) % speeds.length)}
          speeds={speeds}
        />
      )}

      {screen === 'editor' && (
        <Editor
          go={go}
          tab={tab}
          setTab={setTab}
          draftStoryTitle={draft?.title ?? 'Untitled'}
          draftChapterTitle={draft?.draftChapterTitle ?? ''}
          onChapterTitle={onChapterTitle}
          draft={draft?.draftBody ?? ''}
          onDraft={onDraftBody}
          wordCount={wordCount}
          forkedFrom={draft?.forkedFrom ?? null}
          beautifyOpen={beautifyOpen}
          runBeautify={runBeautify}
          closeBeautify={() => setBeautifyOpen(false)}
          healthOpen={healthOpen}
          toggleHealth={() => setHealthOpen((v) => !v)}
          suggestions={suggestions}
          decide={decide}
          acceptAll={acceptAll}
          viewInArrange={viewInArrange}
          scenes={draft?.scenes ?? []}
          dragId={dragId}
          drag={drag}
          highlightScene={highlightScene}
          healthNotes={healthNotes}
        />
      )}

      {screen === 'publish' && (
        <Publish
          go={go}
          pubTitle={pubTitle}
          onPubTitle={(e) => setPubTitle(e.target.value)}
          pubBlurb={pubBlurb}
          onPubBlurb={(e) => setPubBlurb(e.target.value)}
          pubGenresSel={pubGenresSel}
          toggleGenre={toggleGenre}
          visibility={visibility}
          setVisibility={setVisibility}
          saveDraft={() => showToast('Draft saved')}
          doPublish={doPublish}
        />
      )}

      {screen === 'profile' && <Profile profile={profile} />}

      {screen === 'mobile' && (
        <MobileReader playing={playing} togglePlay={togglePlay} progress={progress} story={currentStory} />
      )}

      {/* Fork modal */}
      {forkModalOpen && (
        <div className="nxb-alert__backdrop" onClick={() => setForkModalOpen(false)}>
          <div className="nxb-alert" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3 className="nxb-alert__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconGitFork size={16} />
              Fork this story
            </h3>
            <p className="nxb-alert__body" style={{ marginBottom: 16 }}>
              A fork copies the text into your drafts and keeps a visible link back to{' '}
              {currentStory?.author ?? 'the author'}&rsquo;s original.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {forkKindDefs.map((k) => {
                const selected = forkKind === k.id
                return (
                  <button
                    key={k.id}
                    className="fi-opt-hover"
                    onClick={() => setForkKind(k.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 8,
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: selected ? 'rgba(132, 39, 226, 0.05)' : 'var(--nxb-surface-1)',
                      border: `1px solid ${selected ? 'var(--nxb-text-link)' : 'var(--nxb-border-medium)'}`,
                    }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 9999,
                        border: '1.5px solid var(--nxb-border-strong)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 'none',
                      }}
                    >
                      {selected && (
                        <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--nxb-text-link)' }} />
                      )}
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span className="body" style={{ color: 'var(--nxb-text-primary)', fontWeight: 500 }}>
                        {k.title}
                      </span>
                      <span className="body-s" style={{ color: 'var(--nxb-text-muted)' }}>
                        {k.desc}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="nxb-alert__actions">
              <button className="nxb-alert__btn nxb-alert__btn--secondary" onClick={() => setForkModalOpen(false)}>
                Cancel
              </button>
              <button
                className="nxb-alert__btn"
                onClick={createFork}
                style={{
                  border: '1px solid var(--nxb-border-strong)',
                  background: 'var(--nxb-action-inverse-bg)',
                  color: 'var(--nxb-action-inverse-text)',
                }}
              >
                Create Fork
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 60, animation: 'fablefade 250ms ease-out' }}>
          <div className="nxb-toast">
            <div className="nxb-toast__msg">
              <span className="nxb-toast__icon nxb-toast__icon--success">
                <IconCheck size={24} />
              </span>
              <span className="nxb-toast__label">{toast}</span>
            </div>
            <button className="nxb-toast__close" onClick={() => setToast(null)} aria-label="Dismiss">
              <IconX size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
