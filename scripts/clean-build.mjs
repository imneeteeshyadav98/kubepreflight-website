import { rm } from 'node:fs/promises';

const buildDirectories = ['dist', '.astro'];

await Promise.all(
  buildDirectories.map((directory) =>
    rm(directory, {
      recursive: true,
      force: true
    })
  )
);

console.log('Removed previous Astro build output.');
