declare module "emoji-dictionary" {
  export function getUnicode(name: string): string;
  export function getName(unicode: string): string;
  export function getShortcode(unicode: string): string;
  export function getAllNames(): string[];
}
