import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import glob from 'glob'
import colors from 'colors/safe'
import packageConfig from '../package.json'
import { ICustomAppManifest, INewManifest } from './models/manifests'
const esbuild = require("esbuild")
const postCssPlugin = require("esbuild-plugin-postcss2");
const autoprefixer = require("autoprefixer");

const exec = promisify(require('child_process').exec);

const build = async (watch: boolean) => {
  const spicetifyDirectory = await exec("spicetify -c").then((o: any) => path.dirname(o.stdout.trim()));
  const outDirectory = path.join(spicetifyDirectory, "CustomApps", packageConfig.name);
  const extensions = await glob.sync("./src/extensions/*(*.ts|*.tsx|*.js|*.jsx)");
  const extensionsNewNames = extensions.map(e => e.substring(0, e.lastIndexOf(".")) + ".js");

  // Create the out directory if doesn't exists
  if (!fs.existsSync(outDirectory)){
    fs.mkdirSync(outDirectory);
  }

  if (watch) {
    console.log('Opening spotify with watch mode...')
    await openSpicetify()
  }

  esbuild.build({
    entryPoints: [`./index.tsx`, ...extensions],
    outdir: outDirectory,
    platform: 'browser',
    external: ['react', 'react-dom'],
    bundle: true,
    globalName: "appModule",
    plugins: [
      postCssPlugin.default({
        plugins: [autoprefixer]
      }),
    ],
    watch: (watch ? {
      onRebuild(error: any, result: any) {
        if (error)
          console.error(error)
        else {
          afterBundle();
        }
      },
    } : undefined)
  }).then((r: any) => {
    afterBundle();
    return r;
  })

  if (watch) {
    console.log('watching...');
  }

  function afterBundle() {
    // Generate the manifest.json
    console.log("Generating manifest.json...")
    const newManifest = <INewManifest>JSON.parse(fs.readFileSync("./manifest.json", 'utf-8'))
    const customAppManifest = <ICustomAppManifest>{
      name: newManifest.name,
      icon: fs.readFileSync(path.join('./src', newManifest.icon), 'utf-8'),
      "active-icon": fs.readFileSync(path.join('./src', newManifest.activeIcon), 'utf-8'),
      subfiles: [],
      subfiles_extension: extensionsNewNames.map(e => path.basename(e))
    }
    fs.writeFileSync(path.join(outDirectory, "manifest.json"), JSON.stringify(customAppManifest, null, 2))

    console.log("Moving extensions...")
    extensionsNewNames.forEach(extension => {
      fs.copyFileSync(path.join(outDirectory, extension), path.join(outDirectory, path.basename(extension)))
    });
    
    fs.rmSync(path.join(outDirectory, "src"), { recursive: true, force: true });
    
    console.log("Modifying index.js...")
    const indexJSData = fs.readFileSync(path.join(outDirectory, "index.js"), 'utf-8').split("\n");
    const appendAbove = indexJSData.findIndex((l) => l.includes(`if (typeof require !== "undefined")`))
    indexJSData.splice(appendAbove, 0,        `if (x === "react") return Spicetify.React`);
    indexJSData.splice(appendAbove + 1, 0,    `if (x === "react-dom") return Spicetify.ReactDOM`);
    indexJSData.splice(indexJSData.length, 0, `const render=()=>appModule.default();`);
    
    fs.writeFileSync(path.join(outDirectory, "index.js"), indexJSData.join("\n")+"\n");
    
    console.log("Renaming index.css...")
    if (fs.existsSync('index.css'))
      fs.renameSync(path.join(outDirectory, "index.css"), path.join(outDirectory, "style.css"))
    
    console.log(colors.green('Build succeeded.'));
  }

  async function openSpicetify() {
    const output = await exec(`spicetify config custom_apps ${packageConfig.name}`);
    if (output.stdout.includes("Config changed")) {
      await exec(`spicetify apply`)
      await new Promise(r => setTimeout(r, 2000));
    }
    exec(`spicetify watch -l -a`);
  }
}
 
export default build;