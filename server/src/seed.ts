// Seeds the database with the demo world from the Fable & Ink prototype:
// authors, published stories (each with real chapters so the reader works),
// June Okafor's working draft, the fork graph, and one reading position.
//
// Run standalone with `npm run seed` (drops + reseeds), or it runs automatically
// on boot via seedIfEmpty() when the DB is empty.

import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { User } from './models/User.js'
import { Story } from './models/Story.js'
import { ReadingProgress } from './models/ReadingProgress.js'
import { connectDB, disconnectDB } from './db.js'
import { config } from './config.js'

type ChapterSeed = { title: string; mins: number; secs: number; paras: string[] }

const authors = [
  {
    key: 'june',
    name: 'June Okafor',
    initials: 'JO',
    email: 'june@fableink.test',
    isDemo: true,
    joinedYear: 2024,
    bio: 'Writes quiet stories about loud places — tidelines, tenancies and the things families don’t say. Currently drowning an orchard, slowly.',
  },
  { key: 'mara', name: 'Mara Ellison', initials: 'ME', email: 'mara@fableink.test' },
  { key: 'theo', name: 'Theo Brandt', initials: 'TB', email: 'theo@fableink.test' },
  { key: 'adeyemi', name: 'N. Adeyemi', initials: 'NA', email: 'adeyemi@fableink.test' },
  { key: 'sofia', name: 'Sofia Reyes', initials: 'SR', email: 'sofia@fableink.test' },
  { key: 'whitlock', name: 'P. Whitlock', initials: 'PW', email: 'whitlock@fableink.test' },
  { key: 'ito', name: 'K. Ito', initials: 'KI', email: 'ito@fableink.test' },
  { key: 'ashworth', name: 'D. Ashworth', initials: 'DA', email: 'ashworth@fableink.test' },
  { key: 'vance', name: 'R. Vance', initials: 'RV', email: 'vance@fableink.test' },
]

const lighthouseChapters: ChapterSeed[] = [
  {
    title: 'Arrivals',
    mins: 6,
    secs: 372,
    paras: [
      'The ferry to Wolfe Sound ran twice a week, weather permitting, and the weather rarely permitted. Nell had waited three days on the mainland with a suitcase full of her mother’s papers and a headache shaped like the island.',
      'From the water the lighthouse looked abandoned, which was the point. Her mother had kept it that way for thirty years — no fresh paint, no light after dusk, nothing to invite a second look from passing boats.',
      'The keeper’s house smelled of paraffin and old weather. On the kitchen table, weighted down with a whelk shell, sat an envelope with Nell’s name on it. Not her married name. The old one.',
      'She put the kettle on first. Some conversations, even with the dead, you don’t start cold.',
    ],
  },
  {
    title: 'The Ledger',
    mins: 7,
    secs: 428,
    paras: [
      'The envelope held no letter — only a page torn from the light station’s ledger, October 1994. Four ships logged in her mother’s careful hand. Officially, that month, there had been three.',
      'Nell knew the story of the fourth ship the way you know a house in the dark: by its edges. A trawler out of Skerry Bay, lost with two aboard, never found. The inquiry had blamed the weather. Inquiries usually did.',
      'She spent the morning with the remaining ledgers, cross-checking arrivals against the tide tables her mother kept like scripture. The handwriting never wavered. That was the strange part. You’d expect a lie to press harder on the page.',
      'By noon she had found six more entries that shouldn’t exist. Her headache was gone. That worried her more than anything.',
    ],
  },
  {
    title: 'What the Light Kept',
    mins: 5,
    secs: 316,
    paras: [
      'The lamp room hadn’t been lit since 1996, but someone had been up here. The brass was clean where a hand would fall on the rail, dull everywhere else.',
      'Under the floor grating, wrapped in oilcloth, she found the logbook the inquiry had never seen. Her mother’s writing again — but hurried now, the letters leaning like trees in wind.',
      'The last entry was dated the night the trawler went down. It was one sentence long, and it was not an apology.',
      '“The light was out because I put it out, and I would do it again.” Below it, a name Nell knew. She read it three times, then went downstairs and locked the door, though there was no one on the island to lock out.',
    ],
  },
]

// Compact-but-real chapters for the other shelf stories, so any card opens a
// readable story rather than an empty reader.
function threeChapters(titles: [string, string, string], paras: [string[], string[], string[]]): ChapterSeed[] {
  return titles.map((title, i) => ({
    title,
    mins: 4 + i,
    secs: (4 + i) * 60,
    paras: paras[i],
  }))
}

const scenesSeed = [
  { slug: 'letter', title: 'The Letter', ch: 1, words: '980' },
  { slug: 'lowtide', title: 'Low Tide', ch: 1, words: '1,140' },
  { slug: 'tomas', title: 'Tomas at the Gate', ch: 1, words: '760' },
  { slug: 'rain', title: 'Rain on Glass', ch: 2, words: '1,320', flag: 'Third reflective scene in a row — pacing note points here.' },
  { slug: 'ferry', title: 'The Ferry', ch: 2, words: '890', flag: 'Health Check suggests moving this earlier to break up Ch. 2.' },
  { slug: 'inventory', title: 'Inventory of Losses', ch: 3, words: '1,050', flag: 'Dialogue drops to 4% here, against your 18% average.' },
  { slug: 'orchard', title: 'The Orchard Underwater', ch: 3, words: '1,210' },
  { slug: 'reading', title: 'The Reading', ch: 4, words: '640', flag: 'Natural place to pay off the unopened letter from Ch. 1.' },
]

const orchardDraftBody =
  'She was walking slowly through the wet orchard, and she was thinking about the letter again. The trees stood in a foot of seawater, roots gone soft, and still they held their fruit like they hadn’t heard the news.\n\nThe tide had taken the lower field in March, it had not given it back. Her father would have called that a negotiation. She called it what it was.\n\nSalt had gotten into everything, the door hinges, the bread, her handwriting. At night she could hear the fence posts ticking as they dried. The water was patient. The water was always patient.\n\nTomas had promised to come by before the ferry left. She set two cups out anyway, the way you set a table for a storm.'

export async function seed({ reset = false } = {}) {
  if (reset) {
    await Promise.all([User.deleteMany({}), Story.deleteMany({}), ReadingProgress.deleteMany({})])
  }

  const passwordHash = await bcrypt.hash(config.demoPassword, 10)
  const userDocs = await User.insertMany(
    authors.map((a) => ({
      name: a.name,
      initials: a.initials,
      email: a.email,
      passwordHash,
      isDemo: !!a.isDemo,
      joinedYear: a.joinedYear ?? 2023,
      bio: a.bio ?? '',
    })),
  )
  const U = Object.fromEntries(authors.map((a, i) => [a.key, userDocs[i]._id]))

  // ---- published shelf stories ----
  const lighthouse = await Story.create({
    title: 'The Lighthouse at Wolfe Sound',
    author: U.mara,
    genres: ['Mystery'],
    blurb: 'Nell inherits a lighthouse her mother kept deliberately dark — and a ledger that logs one ship too many.',
    firstLine: 'The ferry to Wolfe Sound ran twice a week, weather permitting, and the weather rarely permitted.',
    blindId: 'STORY-0142',
    readCount: 12400,
    visibility: 'public',
    status: 'published',
    chapters: lighthouseChapters,
  })

  await Story.create([
    {
      title: 'Salt Circuit',
      author: U.theo,
      genres: ['Sci-fi'],
      blurb: 'A desalination rig off Lagos starts routing power to coordinates that don’t exist on any grid.',
      firstLine: 'The rig sang at night, and only Adaeze ever asked what it was singing to.',
      blindId: 'STORY-0387',
      readCount: 8900,
      visibility: 'public',
      status: 'published',
      chapters: threeChapters(
        ['Night Shift', 'The Coordinates', 'Landfall'],
        [
          [
            'The rig sang at night, and only Adaeze ever asked what it was singing to. The others wore ear defenders and called it harmonic stress. She left hers around her neck and listened.',
            'Power draw spiked at 3:14 every morning, a figure precise enough to be a signature. Maintenance logged it as a fault. Adaeze logged it as a message she hadn’t decoded yet.',
          ],
          [
            'The coordinates resolved to open water — no platform, no buoy, nothing the charts admitted to. She ran them twice, then a third time, hoping to be wrong.',
            'When she took the numbers to the shift supervisor, he told her to sleep more. Then he quietly deleted the log. That was the moment she decided to go and look.',
          ],
          [
            'Landfall, if you could call it that, was a slab of poured concrete the sea had almost finished reclaiming. Something beneath it was still drawing power, patient as a tide.',
            'Adaeze crouched at the waterline and, for the first time, hummed back. The rig, half a mile behind her, answered on key.',
          ],
        ],
      ),
    },
    {
      title: 'The Cartographer’s Debt',
      author: U.adeyemi,
      genres: ['Fantasy'],
      blurb: 'Every map Isolde draws comes true within the year. Someone has commissioned a map of the capital, burning.',
      firstLine: 'Isolde charged double for coastlines, because coastlines liked to argue.',
      blindId: 'STORY-0051',
      readCount: 21700,
      visibility: 'public',
      status: 'published',
      chapters: threeChapters(
        ['The Commission', 'Ink and Consequence', 'The Capital, Burning'],
        [
          [
            'Isolde charged double for coastlines, because coastlines liked to argue. Rivers were worse, but at least rivers kept their promises within a season.',
            'The man who came at dusk did not haggle. He unrolled an empty sheet and named a fee that would have bought her street. He wanted the capital, he said. Precisely as it would look one year hence.',
          ],
          [
            'She knew the cost of her gift the way a swimmer knows the cold: all at once, then not at all. Whatever she drew, the world hurried to match.',
            'So she drew slowly, and she drew true, and every tower she inked leaned a fraction closer to the flame she had not yet permitted herself to add.',
          ],
          [
            'On the last night she sat with the finished map and a single unlit lamp. One stroke of orange and the commission would be complete. One stroke, and a hundred thousand roofs would learn her handwriting.',
            'She set the pen down. Then she picked it up again. History would record that the fire started with a cartographer’s hesitation — and no one would ever know how long it lasted.',
          ],
        ],
      ),
    },
    {
      title: 'Ninety Days of Rain',
      author: U.sofia,
      genres: ['Romance'],
      blurb: 'Two strangers keep meeting under the same broken awning. Neither will admit they’ve stopped carrying an umbrella.',
      firstLine: 'The forecast said rain until October, which suited Marisol fine.',
      blindId: 'STORY-0466',
      readCount: 5200,
      visibility: 'public',
      status: 'published',
      chapters: threeChapters(
        ['Broken Awning', 'Two Umbrellas', 'October'],
        [
          [
            'The forecast said rain until October, which suited Marisol fine. Rain gave her somewhere to stand and a reason not to explain herself.',
            'The awning outside the shuttered bakery leaked in exactly one place, and there was room, just barely, for two people determined not to touch.',
          ],
          [
            'By the second week they had a rhythm. He brought coffee in two cups and pretended the second was an accident. She brought nothing and pretended not to notice the pretending.',
            'Somewhere in there they both stopped bringing umbrellas. Neither said so. It is possible to fall a long way inside a silence that size.',
          ],
          [
            'October arrived the way endings do — quietly, and on schedule. The sky cleared. The awning had nothing left to offer them.',
            'They stood in the sudden sun, out of excuses, and Marisol discovered she had prepared for rain and not at all for this.',
          ],
        ],
      ),
    },
    {
      title: 'A Quiet Kind of Theft',
      author: U.whitlock,
      genres: ['Mystery'],
      blurb: 'Nothing is ever missing from the Harrow estate. Things are only, ever so slightly, replaced.',
      firstLine: 'The first forgery Edith noticed was the teapot, because the real one had never poured straight.',
      blindId: 'STORY-0219',
      readCount: 9800,
      visibility: 'public',
      status: 'published',
      chapters: threeChapters(
        ['The Teapot', 'Replacements', 'The Inventory'],
        [
          [
            'The first forgery Edith noticed was the teapot, because the real one had never poured straight, and this one did. A lesser housekeeper would have been grateful.',
            'She was not a lesser housekeeper. She had run Harrow for forty years, and she knew its flaws the way a mother knows a child’s — fondly, and completely.',
          ],
          [
            'After the teapot came the third stair, which had stopped complaining, and the study clock, which now kept perfect time. Each improvement was a small robbery of character.',
            'Someone was replacing the house with a better-behaved version of itself. Edith began, quietly, to keep a list.',
          ],
          [
            'The inventory took her a month, done at night, by candle, so the new electric lights would not report her. Ninety-one items. Ninety-one small betrayals.',
            'On the last page she wrote a ninety-second entry, and then, after some thought, a name. She had a fair idea who was hollowing out her house. She simply could not yet prove it wore her employer’s face.',
          ],
        ],
      ),
    },
    {
      title: 'Glasshouse Summer',
      author: U.ito,
      genres: ['YA'],
      blurb: 'The last summer before everyone leaves, four friends inherit the keys to the school greenhouse — and its rumors.',
      firstLine: 'The greenhouse key was warm, which made no sense, and Jun pocketed it anyway.',
      blindId: 'STORY-0330',
      readCount: 14100,
      visibility: 'public',
      status: 'published',
      chapters: threeChapters(
        ['The Key', 'Rumors', 'Last Summer'],
        [
          [
            'The greenhouse key was warm, which made no sense, and Jun pocketed it anyway. Some decisions you make with your hand before your head gets a vote.',
            'They had one summer left before the four of them scattered to cities that didn’t know their names. The greenhouse felt like a way to make it last.',
          ],
          [
            'The rumors were older than any of them: that the glasshouse grew what you were most afraid to want. Nobody believed it. Everybody, privately, tested it.',
            'Mika planted nothing and watched a vine of somethings climb toward the light. Jun didn’t ask what she’d wished for. Friendship is partly the art of the unasked question.',
          ],
          [
            'On the last night they left the door open on purpose, the way you leave a light on for someone who isn’t coming back.',
            'The key had gone cold in Jun’s pocket. Summer does that. It warms your hand right up until the moment it decides you’re ready to let go.',
          ],
        ],
      ),
    },
  ])

  // ---- June's published stories ----
  const orchardPublished = await Story.create({
    title: 'The Orchard Underwater',
    author: U.june,
    genres: ['Literary'],
    blurb: 'A flooded orchard, an unopened letter, and a family that negotiates with the sea.',
    firstLine: 'She was walking slowly through the wet orchard, thinking about the letter again.',
    blindId: 'STORY-0611',
    readCount: 8100,
    visibility: 'public',
    status: 'published',
    chapters: threeChapters(
      ['The Letter', 'Low Tide', 'The Orchard Underwater'],
      [
        [
          'She was walking slowly through the wet orchard, thinking about the letter again. The trees stood in a foot of seawater, roots gone soft, and still they held their fruit like they hadn’t heard the news.',
          'The tide had taken the lower field in March; it had not given it back. Her father would have called that a negotiation. She called it what it was.',
        ],
        [
          'At low tide the orchard showed its bones — the drowned rows, the fence posts ticking as they dried, the salt in everything down to her handwriting.',
          'She set two cups out for Tomas, the way you set a table for a storm, and waited to see which arrived first.',
        ],
        [
          'The water was patient. The water was always patient, and eventually the orchard would belong to it entirely.',
          'She read the letter one last time, then folded it into a boat, the way she had as a child, and set it on the flood to see how far a family’s silence could travel.',
        ],
      ],
    ),
  })

  const winterTenants = await Story.create({
    title: 'The Winter Tenants',
    author: U.june,
    genres: ['Mystery'],
    blurb: 'A boarding house that only fills in the coldest months, and a landlord who never advertises.',
    firstLine: 'They arrived with the first frost, the way they always did, and paid in exact change.',
    blindId: 'STORY-0620',
    readCount: 12900,
    visibility: 'public',
    status: 'published',
    chapters: threeChapters(
      ['First Frost', 'Room Nine', 'Thaw'],
      [
        [
          'They arrived with the first frost, the way they always did, and paid in exact change. Nobody in town could say where the winter tenants came from, only that the house was never empty when the snow was deep.',
          'The landlord kept no ledger a stranger could read. He simply knew, each October, exactly how many rooms he would need.',
        ],
        [
          'Room Nine had not been let in living memory, and yet its bed was always warm by December. The tenants stepped around the question the way you step around a sleeping dog.',
          'A new arrival, younger than the rest, made the mistake of asking who slept there. The house answered before the landlord could.',
        ],
        [
          'By the thaw they were gone again, rooms stripped, change counted, frost retreating from the glass.',
          'The landlord swept the halls and left Room Nine for last, as he always did, and as he always did, he did not go in.',
        ],
      ],
    ),
  })

  await Story.create({
    title: 'Petrichor',
    author: U.june,
    genres: ['Short fiction'],
    blurb: 'One rainstorm, one kitchen, and everything a mother and daughter never managed to say.',
    firstLine: 'It rained the afternoon of the funeral, and the kitchen smelled like every summer they’d wasted.',
    blindId: 'STORY-0633',
    readCount: 3400,
    visibility: 'public',
    status: 'published',
    chapters: threeChapters(
      ['The Storm', 'The Kitchen', 'After'],
      [
        [
          'It rained the afternoon of the funeral, and the kitchen smelled like every summer they’d wasted. Rain has a way of returning you to the rooms you thought you’d left.',
          'She stood at the counter where her mother had stood, and found the gesture already waiting in her hands.',
        ],
        [
          'There was tea to make because there is always tea to make, and it gave them both — the living and the missing — somewhere to put their hands.',
          'She said the thing at last, quietly, to the window. It was decades late and exactly on time.',
        ],
        [
          'After, the rain thinned to nothing, and the smell went with it, the way petrichor does — all at once, and only while it lasts.',
          'She washed the single cup and set it, still warm, in the rack, and let the afternoon be over.',
        ],
      ],
    ),
  })

  // ---- June's working draft (the editor) ----
  await Story.create({
    title: 'The Orchard Underwater',
    author: U.june,
    genres: ['Literary'],
    blurb: 'A flooded orchard, an unopened letter, and a family that negotiates with the sea.',
    firstLine: '',
    blindId: 'STORY-0777',
    readCount: 0,
    visibility: 'private',
    status: 'draft',
    draftChapterTitle: 'The Orchard Underwater',
    draftBody: orchardDraftBody,
    scenes: scenesSeed,
  })

  // ---- fork graph ----
  await Story.create([
    // Forks of the Lighthouse (drive the reader's Remix tree).
    { title: 'Wolfe Sound: The Keeper’s Version', author: U.ashworth, genres: ['Mystery'], blurb: 'The same season, told by the woman who kept the light.', firstLine: '', blindId: 'STORY-0143', readCount: 2100, visibility: 'public', status: 'published', parentStory: lighthouse._id, forkKind: 'altpov' },
    { title: 'What the Sea Kept', author: U.vance, genres: ['Mystery'], blurb: 'An ending where the fourth ship comes home.', firstLine: '', blindId: 'STORY-0144', readCount: 1800, visibility: 'public', status: 'published', parentStory: lighthouse._id, forkKind: 'ending' },
    { title: 'Signal Fires', author: U.ito, genres: ['Mystery'], blurb: 'A spin-off following the coast’s other dark lighthouses.', firstLine: '', blindId: 'STORY-0145', readCount: 3300, visibility: 'public', status: 'published', parentStory: lighthouse._id, forkKind: 'spinoff' },

    // Forks of June's work (drive the Profile "forks of her work" list).
    { title: 'The Orchard Above Water', author: U.vance, genres: ['Literary'], blurb: 'An ending where the tide gives the field back.', firstLine: '', blindId: 'STORY-0612', readCount: 900, visibility: 'public', status: 'published', parentStory: orchardPublished._id, forkKind: 'ending' },
    { title: 'Tomas, Ashore', author: U.ashworth, genres: ['Literary'], blurb: 'The same coast, from the man who kept promising to visit.', firstLine: '', blindId: 'STORY-0613', readCount: 1200, visibility: 'public', status: 'published', parentStory: orchardPublished._id, forkKind: 'spinoff' },
    { title: 'The Landlord’s Winter', author: U.sofia, genres: ['Mystery'], blurb: 'Room Nine, from the one who never goes in.', firstLine: '', blindId: 'STORY-0621', readCount: 1500, visibility: 'public', status: 'published', parentStory: winterTenants._id, forkKind: 'altpov' },
    { title: 'The Winter Tenants: Room Nine', author: U.ito, genres: ['Mystery'], blurb: 'A branch that finally opens the door.', firstLine: '', blindId: 'STORY-0622', readCount: 2400, visibility: 'public', status: 'published', parentStory: winterTenants._id, forkKind: 'branch' },
  ])

  // ---- reading progress: June, mid-way through the Lighthouse ----
  await ReadingProgress.create({ user: U.june, story: lighthouse._id, chapterIndex: 1, percent: 61 })

  console.log(`🌱  Seeded ${userDocs.length} users and ${await Story.estimatedDocumentCount()} stories`)
}

export async function seedIfEmpty() {
  const count = await User.estimatedDocumentCount()
  if (count > 0) {
    console.log('🌱  Database already has data — skipping seed')
    return
  }
  await seed({ reset: false })
}

// Allow `npm run seed` to reset + reseed as a standalone script.
const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (invokedDirectly) {
  connectDB()
    .then(() => seed({ reset: true }))
    .then(() => disconnectDB())
    .then(() => {
      console.log('✅  Seed complete')
      process.exit(0)
    })
    .catch((err) => {
      console.error('Seed failed:', err)
      process.exit(1)
    })
}
