
const reset = '\x1b[0m';
const colors = new Map<string, string>([
  ['yellow', '\x1b[33m'],
  ['red', '\x1b[31m'],
  ['green', '\x1b[32m'],
  ['blue', '\x1b[34m'],
]);

type Text = string | undefined;
const colorText = (text: Text, color: string): Text => {
  if (!colors.has(color) || !text) return text;

  return `${colors.get(color)}${text}${reset}`;
};

export const color = {
  yellow: (text: Text) => colorText(text, 'yellow'),
  red: (text: Text) => colorText(text, 'red'),
  green: (text: Text) => colorText(text, 'green'),
  blue: (text: Text) => colorText(text, 'blue')
};
