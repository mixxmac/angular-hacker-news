import * as fs from 'fs';
import { renderModuleFactory } from '@angular/platform-server';

const templateCache: {[key:string]: string} = {}; // cache for page templates
const outputCache: {[key:string]: string} = {};   // cache for rendered pages

export function ngUniversalEngine(setupOptions: any) {

  return function (filePath: string, options: { req: Request }, callback: (err: Error|null, html: string) => void) {
    let url: string = options.req.url;
    if (url.startsWith('/index.html') || url.startsWith('/item/')) {
      url = '/';
    }
    let html: string = outputCache[url];
    if (html) {
      // return already-built page for this url
      callback(null, html);
      return;
    }

    console.log('building: ' + url);
    if (!templateCache[filePath]) {
      let file = fs.readFileSync(filePath);
      templateCache[filePath] = file.toString();
    }

    // render the page via angular platform-server
    let appModuleFactory = setupOptions.bootstrap[0];
    renderModuleFactory(appModuleFactory, {
      document: templateCache[filePath],
      url: url
    }).then(str => {
      outputCache[url] = str;
      callback(null, str);
    });
  };
}