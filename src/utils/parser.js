import { XMLParser } from 'fast-xml-parser';

export async function parseXML(fileName) {
  try {
    const response = await fetch(fileName);
    const xmlText = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      isArray: (name) => ['H', 'RI', 'P', 'ReliefType'].includes(name),
    });

    const parsedData = parser.parse(xmlText);

    const boreholes = parsedData.BlastMaker_Project.BoreHoles.H;
    const reliefItems = parsedData.BlastMaker_Project.ReliefItems.RI;
    const reliefTypes = parsedData.BlastMaker_Project.ReliefTypes.ReliefType;

    return { boreholes, reliefItems, reliefTypes };

  } catch (err) {
    console.error('Error parsing XML: ', err);
    return null;
  }
}

