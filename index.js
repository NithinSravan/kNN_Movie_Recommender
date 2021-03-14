let data;
let resultP;
let resultDivs = [];
let topNames = [];
let users = {};
let similarityScores = {};

//DOM
let dropdown1 = document.getElementById("d1");
let dropdown2 = document.getElementById("d2");
let labels = document.querySelectorAll("label");
let resBox = document.getElementById("result");
let simBox = document.getElementById("sim");
let rateinp = document.querySelectorAll("input");
let panels = document.getElementsByClassName("panel");


//AJAX request to get the JSON file and load it asynchronously
function loadJSON(callback) {
  let xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", "movies.json", true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

function load() {
  loadJSON(function (response) {
    // Parse JSON string into object
    data = JSON.parse(response);
    if (data !== undefined) setup();
  });
}

//setup dropdown menu
function setup() {
  for (let i = 0; i < data.users.length; i++) {
    let id = data.users[i].id;
    let option1 = document.createElement("option");
    option1.value = id;
    option1.innerText = id;
    dropdown1.appendChild(option1);
    let option2 = document.createElement("option");
    option2.value = id;
    option2.innerText = id;
    dropdown2.appendChild(option2);
    users[id] = data.users[i];
  }

}

//finds the euclidean distance of two ratings and inverse of that gives similarity 
function euclideanSimilarity() {
  let id1 = dropdown1.value;
  let id2 = dropdown2.value;

  let ratings1 = users[id1];
  let ratings2 = users[id2];

  let titles = Object.keys(ratings1);
  let i = titles.indexOf("id");
  titles.splice(i, 1);

  let sumSquares = 0;
  for (let i = 0; i < titles.length; i++) {
    let title = titles[i];
    let rating1 = ratings1[title];
    let rating2 = ratings2[title];
    if (rating1 != null && rating2 != null) {
      let diff = rating1 - rating2;
      sumSquares += diff * diff;
    }
  }
  let d = Math.sqrt(sumSquares);

  let similarity = 1 / (1 + d);
  let div = document.createElement("div");
  panels[0].appendChild(div);
  div.innerText =
    "Similarity Score between the users is: " + similarity.toFixed(3);
  console.log(similarity);
}

//function that gets user input and calls KNN function
function predictRatings() {
  let newUser = {};
  for (let i = 0; i < labels.length; i++) {
    let title = labels[i].innerText;
    let rating = rateinp[i].value;
    if (rating == "") {
      rating = null;
    }
    newUser[title] = rating;
  }

  findNearestNeighbors(newUser);
}

/*this function sorts the similarity scores of the current user with the users in the dataset
 and then it shows the the top 5 users with similar taste as that of the current user.
 It also outputs the ratings that the current user would have rated the movies they haven't seen
 thus proving as an index to recommend them the movie based on their predicted ratings.
*/
function findNearestNeighbors(user) {
  for (let i = 0; i < resultDivs.length; i++) {
    resultDivs[i].remove();
  }
  resultDivs = [];
  topNames = [];

  for (let i = 0; i < data.users.length; i++) {
    let other = data.users[i];
    let similarity = euclideanDistance(user, other);

    similarityScores[other.id] = similarity;
  }

  data.users.sort(compareSimilarity);

  let k = 5;

  for (let i = 0; i < k; i++) {
    let id = data.users[i].id;

    let score = similarityScores[id];
    let namesDiv = document.createElement("div");
    simBox.appendChild(namesDiv);
    namesDiv.innerText = id + ": " + score.toFixed(3);
    topNames.push(namesDiv);
    console.log(id + ": " + score.toFixed(3));
  }

  for (let i = 0; i < data.titles.length; i++) {
    let title = data.titles[i];
    if (user[title] == null) {
      let k = 5;
      let weightedSum = 0;
      let similaritySum = 0;
      for (let j = 0; j < k; j++) {
        let id = data.users[j].id;
        let sim = similarityScores[id];
        let ratings = data.users[j];
        let rating = ratings[title];
        if (rating != null) {
          weightedSum += rating * sim;
          similaritySum += sim;
        }
      }

      let stars = weightedSum / similaritySum;

      let resultDiv = document.createElement("div");
      resBox.appendChild(resultDiv);
      resultDiv.innerText = title + ": " + stars.toFixed(3).toString();

      console.log(title + ": " + stars.toFixed(3).toString());
      resultDivs.push(resultDiv);
    }
  }
}

//callback func to compare the similarity scores
function compareSimilarity(a, b) {
  let score1 = similarityScores[a.id];
  let score2 = similarityScores[b.id];
  return score2 - score1;
}

//returns the similarity score calculated exactly like euclideanSimilarity()
function euclideanDistance(ratings1, ratings2) {
  let titles = data.titles;

  let sumSquares = 0;
  for (let i = 0; i < titles.length; i++) {
    let title = titles[i];
    let rating1 = ratings1[title];
    let rating2 = ratings2[title];
    if (rating1 != null && rating2 != null) {
      let diff = rating1 - rating2;
      sumSquares += diff * diff;
    }
  }
  let d = Math.sqrt(sumSquares);

  let similarity = 1 / (1 + d);
  return similarity;
}


//call to load the JSON file
load();


