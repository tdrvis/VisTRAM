export function linksMatrixToArray(dataset) {
  //deletes header collumns
  for (let i = 0; i < dataset.length; i++) {
    dataset[i].splice(0, 3);
  }
  //deletes header rows
  dataset.splice(0, 3);

  const allLinks = [];
  //returns index (+1) of al instances of 'Y' i.e. IDs of linked activities
  for (let i = 0; i < dataset.length; i++) {
    var links = [];
    for (let j = 0; j < dataset[i].length; j++) {
      if (dataset[i][j] === "Y") {
        links.push([j + 1]);
      }
    }
    allLinks.push(links.flat());
  }

  return allLinks;
}

export default linksMatrixToArray;