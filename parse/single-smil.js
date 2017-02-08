import { dirname } from '../path-helpers.js';
import extractSmilData from '../extract/smil-data';
import fetchXml from '../fetch/xml';

export default function parseSingleSmil(src, id, refinement, baseUri) {
  return fetchXml(src)
    .then(xml => extractSmilData(xml, id, refinement, dirname(src)));
}
