# Spicetify Custom App Template
STILL NEED TO BE TESTED | NOT READY YET

A template for making Spicetify Custom Apps.

## Features
- Typescript/Javascript support
- React syntax
- Node modules
- CSS/SCSS global and modules (PostCSS)
- Improved Custom App's structure 
- Under 1 second compile time with esbuild
- Save & reload (Save and the changes will appear in Spotify)

## Getting started
### Structure
- All your code should be inside the `src` folder.  
- The default component exported from `src/app.tsx` will be displayed as your Custom App.  
- Each file in the `src/extensions` folder is an extension of its own.  
- the Custom App's folder name is the name in `package.json`
- the Custom App's name in Spotify is the name in `manifest.json`

### Running
1. [Create a repo from this repo](https://github.com/FlafyDev/spicetify-custom-app/generate)
2. Clone the new repo to your computer
3. Open a terminal in the new repo's folder and enter this:
```
yarn
yarn run watch
```

### The Template's Example
The template includes:
- 2 SCSS files (1 module and 1 global).
- A counter for the Custom App.
- An extension that says "Welcome!" whenever Spotify starts.

## Tested
- [x] Windows
- [ ] MacOS
- [ ] Linux
