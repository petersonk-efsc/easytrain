/*
 * JavaScript for Convert
 *
 * KP
 * Dec 17, 2020
 */

modToXml = Module.cwrap('modToXml', 'string', ['string','number']);
resToXml = Module.cwrap('resToXml', 'string', ['string','number']);
xmlToRes = Module.cwrap('xmlToRes', 'string', ['string','number']);
