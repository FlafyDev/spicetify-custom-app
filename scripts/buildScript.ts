import browserify from 'browserify'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import glob from 'glob'
import colors from 'colors/safe'
import packageConfig from '../package.json'
import { ICustomAppManifest, INewManifest } from './models/manifests'

const exec = promisify(require('child_process').exec);


const build = async (watch: boolean) => {
  const spicetifyDirectory = await exec("spicetify -c").then((o: any) => path.dirname(o.stdout.trim()));
  const outDirectory = path.join(spicetifyDirectory, "CustomApps/" + packageConfig.name);
  const extensions = await glob.sync("./src/extensions/*(*.ts|*.tsx|*.js|*.jsx)");
  const extensionsNewNames = extensions.map(e => path.basename(e.substring(0, e.lastIndexOf(".")) + ".js"));

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
    subfiles_extension: extensionsNewNames
  }
  fs.writeFileSync(path.join(outDirectory, "manifest.json"), JSON.stringify(customAppManifest, null, 2))
  
  console.log("Entering build loop...")

  // Set up browserify for the custom app
  const bCustomApp = browserify({
    standalone: 'appModule', 
    cache: {}, 
    packageCache: {},
    entries: ['./src/index.tsx'],
    plugin: ["tsify"],
  })
  if (watch) {
    bCustomApp.plugin("watchify")
    bCustomApp.on('update', buildCustomApp);
  }
  buildCustomApp();
  
  async function buildCustomApp() {
    console.log("Bundling...");
    try {
      fs.writeFile(path.join(outDirectory, "index.js"), await streamToString(bCustomApp.bundle()).then(s => s + `
        function render() {return appModule.render();}
      `), err => !err || console.error(err));
    } catch (err) {
      console.log(colors.red("An error occurred while bundling: " + err));
      return;
    }

    console.log(colors.green("Done building the CustomApp!"));
  }

  // Set up browserify for the extensions
  extensions.forEach((extension, i) => {
    const b = browserify({
      cache: {}, 
      packageCache: {},
      entries: [extension],
      plugin: ["tsify"],
    })
    if (watch) {
      b.plugin("watchify")
      b.on('update', () => buildExtension(b, extensionsNewNames[i]))
    }
    buildExtension(b, extensionsNewNames[i])
  })

  async function buildExtension(b: browserify.BrowserifyObject, fileName: string) {
    console.log("Bundling...");
    b.bundle().pipe(fs.createWriteStream(path.join(outDirectory, fileName)))
    console.log(colors.green(`Done building ${fileName}!`));
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