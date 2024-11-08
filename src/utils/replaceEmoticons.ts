import emoji from "emoji-dictionary";

const replaceEmoticons = (text: string) => {
  return text.replace(/:\w+:/g, (match) => emoji.getUnicode(match) || match);
};

export default replaceEmoticons;
