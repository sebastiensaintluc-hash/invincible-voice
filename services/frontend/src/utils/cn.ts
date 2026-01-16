import cx, { type ClassArray } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassArray): string {
  return twMerge(cx(inputs));
}
