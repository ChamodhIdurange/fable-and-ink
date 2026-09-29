import { genreColor } from '../data.js'
import { IconClock, IconArrowRight } from './Icon.jsx'

/**
 * The story card, shared by Home's "fresh off the press" shelf and the
 * Discover feed. The genre colour drives the cover wash through the --fi-tint
 * custom property; everything else is CSS.
 *
 * In Blind Read the server has already stripped the author, counts and title
 * attribution, so the card swaps to its dark variant and shows the story's
 * first line where the byline would be.
 */
export default function StoryCard({ story, onOpen, preview = false }) {
  const c = story.genreColor || genreColor(story.genre)
  const blind = !!story.blind

  return (
    <article
      {...(preview
        ? {}
        : {
            'data-lift': '',
            role: 'button',
            tabIndex: 0,
            onClick: () => onOpen(story.id),
            onKeyDown: (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen(story.id)
              }
            },
          })}
      className={`fi-story-card${blind ? ' fi-story-card--blind' : ''}${preview ? ' fi-story-card--preview' : ''}`}
      style={{ '--fi-tint': c }}
    >
      <div className="fi-story-card__wash">
        <span
          className="fi-tag"
          style={{
            color: blind ? `color-mix(in srgb, ${c} 62%, #ffffff)` : c,
            background: `color-mix(in srgb, ${c} ${blind ? 26 : 14}%, transparent)`,
          }}
        >
          {story.genre}
        </span>
        <span className="meta" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <IconClock size={12} />
          {story.readTime} min
        </span>
        {blind && <span className="fi-story-card__blind-id">{story.blindId}</span>}
        {!blind && !preview && (
          <span className="fi-story-card__go" aria-hidden="true">
            <IconArrowRight size={15} />
          </span>
        )}
      </div>

      <h3 className="fi-story-card__title">{story.title}</h3>
      <p className="fi-story-card__blurb">{story.blurb}</p>

      {!blind && (
        <div className="fi-story-card__footer">
          <span className="fi-avatar fi-avatar--sm">{story.initials}</span>
          <span className="body-s">{story.author}</span>
          <span className="meta" style={{ marginLeft: 'auto' }}>
            {story.stats}
          </span>
        </div>
      )}

      {blind && (
        <div className="fi-story-card__footer fi-story-card__firstline">
          <span className="label">first line</span>
          <q>{story.firstLine}</q>
        </div>
      )}
    </article>
  )
}
