import { dirname } from '../path-helpers.js';
import extractManifest from '../extract/manifest';
import extractMetadata from '../extract/metadata';
import extractRootFile from '../extract/root-file';
import extractSpine from '../extract/spine';
import extractToc from '../extract/toc';
import fetchContainerXml from '../fetch/container-xml';
import fetchRootXml from '../fetch/root-xml';
import fetchTocHtml from '../fetch/toc-html';
import getTocItem from '../extract/get-toc-item';

export default function parse(uri, manifestMediaTypeWhitelist=false) {
  let packageDirectory;

  return fetchContainerXml(uri)
    .then(containerXml => extractRootFile(containerXml))
    .then(rootFile => {
      packageDirectory = dirname(rootFile);
      return fetchRootXml(uri, rootFile);
    })
    .then(rootXml => {
      const manifest = extractManifest(rootXml, manifestMediaTypeWhitelist);
      const tocItem = getTocItem(manifest);
      const spine = extractSpine(rootXml, tocItem);

      return fetchTocHtml(uri, tocItem.href, packageDirectory)
        .then(tocHtml => ({
          packageDirectory,
          manifest,
          metadata: extractMetadata(rootXml, manifest),
          spine,
          toc: extractToc(tocHtml, manifest, spine)
        }));
    })
    .catch(err => {
      let nextErr = err;

      if (/Cannot read property 'getAttribute' of null/.test(err.message)) {
        nextErr = new Error(`We couldn't find a book at ${uri}.`);
      }

      throw nextErr;
    });
}