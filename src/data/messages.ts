import narrationWords from './narration-words.json' with { type: 'json' };
export interface Cue { start: number; end: number; text: string }
export interface WordCue { start: number; end: number; block: string; index: number }
export interface Message {
  id: string; title: string; subtitle: string; greeting: string;
  paragraphs: string[]; signature: string;
  narrator: string; voice: string; audio: string | null;
  cues: Cue[]; treatment: 'botanical' | 'scrapbook' | 'memories' | 'stars' | 'intimate';
  images: {src: string; alt: string}[];
  words?: WordCue[];
}

// Replace these clearly identified sample letters with your own words before sharing.
// Four supplied recordings use locally transcribed word timestamps; the wishes chapter awaits audio.
export const settings = {
  recipient: 'Kimberly Ann', sender: 'Someone who cares', isSample: true,
  backgroundAudio: null as string | null,
};
export const messages: Message[] = [
  { id: 'birthday', title: 'The birthday letter', subtitle: 'A little celebration of you.', greeting: `Happy birthday, ${settings.recipient}.`,
    paragraphs: ['Today is a lovely excuse to pause, put the world on hold, and celebrate you. No grand speeches. Just a few words, gathered here with care.', 'May your day be full of the things that make you feel most like yourself. A slow morning. Your favourite song. A little laughter that stays with you long after the moment has passed.', 'And as another year begins, may you remember this: you deserve the same kindness, warmth, and care that you give so freely.'], signature: 'With so much love', narrator: 'Birthday voiceover', voice: 'Your supplied recording', audio: '/audio/vm1.mp3', cues: [], treatment: 'botanical', images: [] },
  { id: 'appreciation', title: 'Things I appreciate about you', subtitle: 'The little things are the big things.', greeting: 'For all that you are.',
    paragraphs: ['Your kindness. The quiet kind that asks for nothing in return, but makes a difference all the same.', 'Your curiosity. The way you make room for another possibility, another story, another way of seeing the world.', 'Your own way of being. There is no one else who can bring exactly what you bring. I hope you never feel you have to be anyone else.'], signature: 'You are appreciated', narrator: 'Birthday voiceover', voice: 'Your supplied recording', audio: '/audio/vm2.mp3', cues: [], treatment: 'scrapbook', images: [] },
  { id: 'feelings', title: 'What you mean to me', subtitle: 'A few feelings, finally put into words.', greeting: 'Kimberly Ann,',
    paragraphs: ["I wanted to give you more than a birthday greeting, Kimberly Ann. I wanted to put a little of what I feel into words, even if I cannot make them come out perfectly. You mean a lot to me, and I hope this letter helps you feel that.","I care about you. About how you are feeling, about the things you hope for, and about the small things that make you happy. I want good things for you, even the ones I cannot give you myself.","I do not want this letter to ask anything of you. I just want to be honest about the affection behind it. You have a special place in my heart, and making this for you is my way of letting you know.","So, on your birthday, this is what I hope reaches you most: I am glad you are here. You matter to me. And behind every little part of this letter is someone who wanted to make you smile."], signature: 'With a heart full of care', narrator: 'Birthday voiceover', voice: 'Your supplied recording', audio: '/audio/vm4new.mp3', cues: [], treatment: 'intimate', images: [] },
  { id: 'wishes', title: 'My wishes for you', subtitle: 'More than a birthday wish. A wish for your whole heart.', greeting: 'Dear Kimberly Ann,',
    paragraphs: ["Kimberly Ann, if I could give you something beyond these words, it would be the feeling of knowing how deeply you matter. Not only on your birthday, and not only when life is going well. On the quiet, ordinary days too, I hope you feel loved without having to do anything to deserve it.","My wish for you is a life that feels gentle in the places where you need gentleness, and full of possibility in the places where you are ready to grow. May you find people you can be completely yourself with, dreams that make you excited for tomorrow, and a little peace that stays even when things are uncertain.","When a day feels heavier than you expected, I hope you remember that you are allowed to rest, to ask for help, and to begin again. You do not have to have every answer. I hope you give yourself time to become whoever you want to be.","More than anything, I wish you a happiness that feels like your own. The kind that reaches you in small moments and makes you glad to be here. Happy birthday, Kimberly Ann. I am so glad you are in this world, and I hope this next year gives you so many reasons to feel the same."], signature: 'With all my heart', narrator: 'Voice 04', voice: 'Bright & uplifting · female', audio: null, cues: [], treatment: 'stars', images: [] },
  { id: 'last', title: 'One last thing', subtitle: 'Something to carry with you.', greeting: 'Just remember this.',
    paragraphs: ['You do not need a birthday to be worth celebrating. You do not need to have everything figured out to be doing beautifully.', 'Wherever this next chapter takes you, I hope it brings you closer to the people, places, and little things that make your life feel full.', 'May this new chapter bring you more reasons to smile, more dreams to follow, and more beautiful moments to remember. Happy birthday.'], signature: 'Always, with love', narrator: 'Birthday voiceover', voice: 'Your supplied recording', audio: '/audio/vm5.mp3', cues: [], treatment: 'intimate', images: [] },
];
for (const message of messages) {
  const key = message.id as keyof typeof narrationWords;
  if (key in narrationWords) message.words = narrationWords[key];
}

