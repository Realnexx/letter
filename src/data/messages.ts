export interface Cue { start: number; end: number; text: string }
export interface Message {
  id: string; title: string; subtitle: string; greeting: string;
  paragraphs: string[]; signature: string;
  narrator: string; voice: string; audio: string | null;
  cues: Cue[]; treatment: 'botanical' | 'scrapbook' | 'memories' | 'stars' | 'intimate';
  images: {src: string; alt: string}[];
}

// Replace these clearly identified sample letters with your own words before sharing.
// Audio stays null until a real recording and verified sentence timings are supplied.
export const settings = {
  recipient: 'Kimberly Ann', sender: 'Someone who cares', isSample: true,
  backgroundAudio: null as string | null,
};
export const messages: Message[] = [
  { id: 'birthday', title: 'The birthday letter', subtitle: 'A little celebration of you.', greeting: `Happy birthday, ${settings.recipient}.`,
    paragraphs: ['Today is a lovely excuse to pause, put the world on hold, and celebrate you. No grand speeches. Just a few words, gathered here with care.', 'May your day be full of the things that make you feel most like yourself. A slow morning. Your favourite song. A little laughter that stays with you long after the moment has passed.', 'And as another year begins, may you remember this: you deserve the same kindness, warmth, and care that you give so freely.'], signature: 'With so much love', narrator: 'Voice 01', voice: 'Gentle & warm · female', audio: null, cues: [], treatment: 'botanical', images: [] },
  { id: 'appreciation', title: 'Things I appreciate about you', subtitle: 'The little things are the big things.', greeting: 'For all that you are.',
    paragraphs: ['Your kindness. The quiet kind that asks for nothing in return, but makes a difference all the same.', 'Your curiosity. The way you make room for another possibility, another story, another way of seeing the world.', 'Your own way of being. There is no one else who can bring exactly what you bring. I hope you never feel you have to be anyone else.'], signature: 'You are appreciated', narrator: 'Voice 02', voice: 'Soft & sincere · female', audio: null, cues: [], treatment: 'scrapbook', images: [] },
  { id: 'memories', title: 'Little memories', subtitle: 'A place for the moments worth keeping.', greeting: 'Some moments stay.',
    paragraphs: ['This is a place for your own favourite memory. Replace this sample with a day, a conversation, or a small moment that still makes you smile.', 'It does not have to be a grand adventure. Sometimes the stories we return to are the simplest ones: a familiar place, a shared laugh, the comfort of good company.', 'Here is to all the beautiful moments still waiting to become memories.'], signature: 'To more moments together', narrator: 'Voice 03', voice: 'Calm storyteller · male', audio: null, cues: [], treatment: 'memories', images: [] },
  { id: 'wishes', title: 'My wishes for you', subtitle: 'For the year that is yours to write.', greeting: 'May this be your year.',
    paragraphs: ['I wish you courage. Enough to begin the thing you have been quietly dreaming about, even before you feel completely ready.', 'I wish you gentleness. Room to rest, permission to change your mind, and days that ask a little less of you.', 'And I wish you joy. Unexpected, ordinary, wonderful joy. The kind you do not have to earn. The kind that finds you just as you are.'], signature: 'Wishing you beautiful things', narrator: 'Voice 04', voice: 'Bright & uplifting · female', audio: null, cues: [], treatment: 'stars', images: [] },
  { id: 'last', title: 'One last thing', subtitle: 'Something to carry with you.', greeting: 'Just remember this.',
    paragraphs: ['You do not need a birthday to be worth celebrating. You do not need to have everything figured out to be doing beautifully.', 'Wherever this next chapter takes you, I hope it brings you closer to the people, places, and little things that make your life feel full.', 'May this new chapter bring you more reasons to smile, more dreams to follow, and more beautiful moments to remember. Happy birthday.'], signature: 'Always, with love', narrator: 'Voice 05', voice: 'Deep & gentle · male', audio: null, cues: [], treatment: 'intimate', images: [] },
];

