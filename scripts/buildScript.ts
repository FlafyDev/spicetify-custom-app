import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import glob from 'glob'
import colors from 'colors/safe'
import packageConfig from '../package.json'
import { ICustomAppManifest, INewManifest } from './models/manifests'
import sassPlugin from 'esbuild-sass-plugin'
import scssModulesPlugin from 'esbuild-scss-modules-plugin'
const esbuild = require("esbuild") // Couldn't do it with import :(
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

  // Generate the manifest.json
  console.log("Generating manifest.json...")
  const newManifest = <INewManifest>JSON.parse(fs.readFileSync("./manifest.json", 'utf-8'))
  const customAppManifest = <ICustomAppManifest>{
    name: newManifest.name,
    icon: newManifest.icon,
    "active-icon": newManifest['active-icon'],
    subfiles: [],
    subfiles_extension: extensionsNewNames.map(e => path.basename(e))
  }
  fs.writeFileSync(path.join(outDirectory, "manifest.json"), JSON.stringify(customAppManifest, null, 2))
  
  console.log("Entering build loop...")

  let moduleCSS = ""
  esbuild.build({
    entryPoints: [`./index.tsx`, ...extensions],
    outdir: outDirectory,
    platform: 'browser',
    external: ['./node_modules/*'],
    bundle: true,
    treeShaking: false,
    globalName: "appModule",
    plugins: [
      scssModulesPlugin({
        inject: false,
        cssCallback(
          css: string, map: {[className: string]: string;}
        ) {
          moduleCSS = css
        }
      }),
      sassPlugin()
    ],
    watch: {
      onRebuild(error: any, result: any) {
        if (error)
          console.error(error)
        else {
          onBuild()
          console.log(colors.green('Build succeeded'))
        }
      },
    },
  }).then(() => {
    onBuild()
    console.log('watching...')
  })

  function onBuild() {
    extensionsNewNames.forEach(extension => {
      fs.copyFileSync(path.join(outDirectory, extension), path.join(outDirectory, path.basename(extension)))
    });
    fs.rmSync(path.join(outDirectory, "src"), { recursive: true, force: true });
    fs.appendFileSync(path.join(outDirectory, "index.js"), `const render=()=>appModule.render();`)
    fs.appendFileSync(path.join(outDirectory, "index.css"), moduleCSS)
    fs.renameSync(path.join(outDirectory, "index.css"), path.join(outDirectory, "style.css"))
  }
}

function streamToString(stream: NodeJS.ReadableStream) {
  const chunks: any[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  })
}
 
export default build;