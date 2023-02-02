import parseDataset from "./datasetParseFunctions/parseDataset";
import parseActivityDataset from "./datasetParseFunctions/parseActivityDataset";
import parseLinks from "./linksParseFunctions/parseLinks";
import makeCyEdges from "./cyElements/makeCyEdges";
import makeCyNodes from "./cyElements/makeCyNodes";
import convertMonthsToDates from "./datasetParseFunctions/convertMonthsToDates";
import makeGantchartItems from "./makeGantchartItems";
import convertDates from "./datasetParseFunctions/convertDates";
import makeCyWpNodes from "./cyElements/makeCyWpNodes";
import getPRPeriods from "./getPRPeriods";
import giveActivityPrPeriod from "./giveActivtyPrPeriod";
import trimData from "./trimData";
import parseTDRMatrix from "./TDRParseFucntions/parseTDRMatrix";
import makeCyStakeholerNodes from "./cyElements/makeCyStakeholderNodes";
import makeStakeholderCyEdges from "./cyElements/makeStakeholderCyEdges";
import makeCyWpEdges from "./cyElements/makeCyWpEdges";
import trimDates from "./datasetParseFunctions/trimDates";

import actDataset from "../data/activity_matrix.txt";
import actLinks from "../data/links.txt";
import wpDataset from "../data/wp_names.txt";
import datesData from "../data/dates.txt";
import tdrDataset from "../data/stakeholder_matrix.txt";

export async function makeVisElements(prPeriod, currentStory, completedDisplay) {
  const activityDataNoDate = await parseActivityDataset(actDataset);
  const links = await parseLinks(actLinks);
  const wpData = await parseDataset(wpDataset);
  const dates = await parseDataset(datesData);

  //adds list f SDGS to wpData object
  for (let i = 0; i < wpData.length; i++) {
    var SDGs = [];
    for (let j = 0; j < 17; j++) {
      wpData[i][`SDG_${j + 1}`] === "1" && SDGs.push(`SDG_${j + 1}`);
    }
    wpData[i].SDGs = SDGs;
  }

  const convertedDates = dates.map((d, i) => ({
    ...d,
    date: convertDates(d.date, null),
  }));

  const trimmedDates = trimDates(convertedDates);
  // This function somehow mutes convertedDates-- works but might need chnaging!!!!
  getPRPeriods(convertedDates);

  const latestPrPeriod = convertedDates[convertedDates.length - 1].prPeriod;

  //adds js readble start and end dates to activity array
  const activityData = activityDataNoDate.map((act, i) => ({
    ...act,
    startDate: convertMonthsToDates(act, dates, "start"),
    endDate: convertMonthsToDates(act, dates, "end"),
    startPrPeriod: giveActivityPrPeriod(act, convertedDates, "start"),
    endPrPeriod: giveActivityPrPeriod(act, convertedDates, "end"),
  }));

  const matrixHeaders = activityData.slice(0, 1)[0];

  //trims the data by filter option, used instead of raw data
  const trimmedData = trimData(activityData, prPeriod, currentStory);
  const trimmedWpData = wpData.filter((wp) => [...new Set(trimmedData.map((act) => act.WP))].includes(wp.id.slice(2)));
  const stakeholderData = await parseTDRMatrix(tdrDataset, trimmedData);

  // console.log(stakeholderData);

  const gantChartItems = makeGantchartItems(
    trimmedData,
    trimmedWpData,
    prPeriod,
    completedDisplay,
    latestPrPeriod,
    convertedDates
  );

  const nodes = makeCyNodes(trimmedData, prPeriod, completedDisplay, latestPrPeriod);

  const edges = makeCyEdges(links, nodes);

  const wpNodes = makeCyWpNodes(trimmedWpData);

  const wpEdges = makeCyWpEdges(trimmedWpData);

  const stakeholderNodes = makeCyStakeholerNodes(stakeholderData);

  const stakeholderEdges = makeStakeholderCyEdges(stakeholderData);

  //node to hold all other nodes, prevents stakeholder nodes entering center of graph
  const projectNode = {
    group: "nodes",
    grabbable: false,
    data: {
      parent: "t",
      id: "project",
      type: "project",
      label: "",
    },
  };

  const p = {
    group: "nodes",
    grabbable: false,
    data: {
      parent: "d",
      id: "t",
      type: "t",
      label: "",
    },
  };
  const d = {
    group: "nodes",
    grabbable: false,
    data: {
      id: "d",
      type: "d",
      label: "",
    },
  };
  const origionalActCount = activityData.length;

  const cyElms = [nodes, stakeholderNodes, edges.flat(), stakeholderEdges.flat(), wpNodes, projectNode, wpEdges].flat();

  return {
    cyElms: cyElms,
    gantChartItems: gantChartItems,
    activityData: trimmedData,
    dates: trimmedDates,
    stakeholderData: stakeholderData,
    matrixHeaders: matrixHeaders,
    origionalActCount: origionalActCount,
    latestPrPeriod: latestPrPeriod,
  };
}

export default makeVisElements;
