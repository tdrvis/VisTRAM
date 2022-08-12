export function makeCyWpEdges(cy, wpData) {
  // loops over all WPs and returns an array of targets of the outgoing edges from that WP
  const wpTargetNodes = [];
  for (let i = 0; i < wpData.length; i++) {
    var targetNodes = getOutgoingEdgeTargets(cy, wpData[i].id);
    wpTargetNodes[wpData[i].id] = targetNodes;
  }

  const wpActIds = [];
  for (let i = 0; i < wpData.length; i++) {
    var d = getWpChildren(cy, wpData[i].id);
    wpActIds[wpData[i].id] = d;
  }

  //Finds all connections between workpackages and returns a weighted edge
  const wpEdges = [];

  for (let i = 0; i < wpData.length - 1; i++) {
    for (let j = i + 1; j < wpData.length; j++) {
      wpEdges.push({
        group: "edges",
        classes: "wpEdge",
        data: {
          id: `${wpData[i].id}${wpData[j].id}`,
          source: `${wpData[i].id}`,
          target: `${wpData[j].id}`,
          weight: wpConectionWeight(
            wpTargetNodes[`${wpData[i].id}`],
            wpActIds[`${wpData[j].id}`],
            wpTargetNodes[`${wpData[j].id}`],
            wpActIds[`${wpData[i].id}`]
          ),
          type: "wpEdge",
        },
      });
    }
  }

  return wpEdges;
}

//retunrs an array of edge targets from each wp
function getWpChildren(cy, wp) {
  var children = cy.nodes(`#${wp}`).children();
  return children.map((e) => e.id()); // returns targets of outgoing edges
}

//retunrs an array of edge targets from each wp
function getOutgoingEdgeTargets(cy, wp) {
  var edges = cy.nodes(`#${wp}`).children().connectedEdges();
  return edges.map((e) => e.data("target")); // returns targets of outgoing edges
}

//gets nodes connecting WPa and WPb and returns there 'weight' (i.e. how many connection there are between WPs)
function wpConectionWeight(array1, array2, array3, array4) {
  const cross1 = getCrossover(array1, array2);
  const cross2 = getCrossover(array3, array4);
  return cross1.length + cross2.length;
}

//check to see if how many ids cross between arrays therfore links between wps
function getCrossover(array1, array2) {
  return array1.filter((element) => array2.includes(element));
}

export default makeCyWpEdges;