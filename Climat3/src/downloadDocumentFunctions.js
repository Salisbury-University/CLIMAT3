//Import the functions you need from firebase firestore
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAiI2TJwXB8Zyg9GWKspaqpVlFPtFpShu8",
  authDomain: "climat3.firebaseapp.com",
  databaseURL: "https://climat3-default-rtdb.firebaseio.com",
  projectId: "climat3",
  storageBucket: "climat3.appspot.com",
  messagingSenderId: "80202285914",
  appId: "1:80202285914:web:b3f8446bbd1a88dafea963",
  measurementId: "G-XXWF74D2S0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize the currently selected articles array
var selectedArticles = [];

//Add an article to be downloaded
export function addArticleToArray(item) {
  if (!selectedArticles.includes(item)) {
    selectedArticles.push(item);
  }
}

//Remove an article to be downloaded
export function removeArticleFromArray(item) {
  if (selectedArticles.includes(item)) {
    selectedArticles = selectedArticles.filter(selected => selected !== item);
  }
}

//Handles the function of a check box being checked or unchecked
export function UpdateSelectedArray(event) {
  //get the text of the selected card
  var ArticleTitle = this.parentNode.textContent.trim();

  //add article if it is checked, and remove it if it is unchecked
  if (event.target.checked) {
    addArticleToArray(ArticleTitle);
  } else {
    removeArticleFromArray(ArticleTitle);
  }

  console.log(selectedArticles); // Display the updated array
}

//turns the string into a blob that is then downloaded as a .rdf file
export async function DownloadXMLRDF() {
  var RDFFile = await(CreateSelectedArticlesRDF());

  var link = document.createElement('a');
  link.download = 'data.rdf';
  var blob = new Blob([RDFFile], {type: 'text/plain'});
  link.href = window.URL.createObjectURL(blob);
  link.click();
}

async function CreateSelectedArticlesRDF() {
  var articleRDFString = addHeadingRDFFile(); //start the rdf file

  //loop through all the selected article titles, add them to the xml
  for (let i = 0; i < selectedArticles.length; i++) {
    var tempStr = selectedArticles[i].replace(/\s/g, ""); //get rid of spaces for the document ID bc spaces break it
    var docRef = doc(db, 'Documents', tempStr);
    var docSnap = await getDoc(docRef);

    //if the document exists, add it to xml, otherwise continue on
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      articleRDFString += addArticleRDFFile(docSnap);
    } else {
      console.log("No such document named " + selectedArticles[i] + " in the collection Documents.");
    }
  }

  //end the rdf file
  articleRDFString += '</rdf:RDF>';
  console.log(articleRDFString);
  return articleRDFString;
}

//this is just the header of an RDF file that we add first
function addHeadingRDFFile() {
  var articleRDFString = "<rdf:RDF\n";
  articleRDFString += 'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n'
  articleRDFString += 'xmlns:z="http://www.zotero.org/namespaces/export#"\n'
  articleRDFString += 'xmlns:dcterms="http://purl.org/dc/terms/"\n'
  articleRDFString += 'xmlns:bib="http://purl.org/net/biblio#"\n'
  articleRDFString += 'xmlns:foaf="http://xmlns.com/foaf/0.1/"\n'
  articleRDFString += 'xmlns:dc="http://purl.org/dc/elements/1.1/"\n'
  articleRDFString += 'xmlns:prism="http://prismstandard.org/namespaces/1.2/basic/">\n'
  return articleRDFString;
}

//for each article we go through and add this one by one. there will be more functions in here for each piece. 
//takes a reference to a document gathered from the database as a parameter
function addArticleRDFFile(document) {
    var articleRDFString = '<bib:Article rdf:about="' + document.data().url + '">\n';
    articleRDFString += '<z:itemType>journalArticle</z:itemType>\n';
    articleRDFString += '<dcterms:isPartOf rdf:resource="urn:issn:' + document.data().issn + '"/>\n';
    articleRDFString += '<bib:authors>\n';
    articleRDFString += '<rdf:Seq>\n';
    articleRDFString += addAuthorsToRDF(document);
    articleRDFString += '</rdf:Seq>\n';
    articleRDFString += '</bib:authors>\n';
    articleRDFString += '<dc:subject>' + 'document.data().manualTags' + '</dc:subject>\n';
    articleRDFString += '<dc:title>' + document.data().title + '</dc:title>\n';
    articleRDFString += '<dcterms:abstract>' + document.data().abstract + '</dcterms:abstract>\n';
    articleRDFString += '<dc:date>' + document.data().date + '</dc:date>\n';
    articleRDFString += '<z:language>' + 'English' + '</z:language>\n';
    articleRDFString += '<dc:identifier>\n';
    articleRDFString += '<dcterms:URI><rdf:value>' + document.data().url + '</rdf:value></dcterms:URI>\n';
    articleRDFString += '</dc:identifier>\n';
    articleRDFString += '<dcterms:dateSubmitted>' + '2023-11-18' + '</dcterms:dateSubmitted>\n';
    articleRDFString += '</bib:Article>\n'
    articleRDFString += '<bib:Journal rdf:about="urn:issn:' + document.data().issn + '">\n';
    articleRDFString += '<prism:volume>' + document.data().volume + '</prism:volume>\n';
    articleRDFString += '<dc:title>' + document.data().pubTitle + '</dc:title>\n';
    articleRDFString += '<dc:identifier>' + document.data().doi + '</dc:identifier>\n';
    articleRDFString += '<prism:number>' + document.data().issue + '</prism:number>\n';
    articleRDFString += '<dc:identifier>' + document.data().issn + '</dc:identifier>\n';
    articleRDFString += '</bib:Journal>\n';
    return articleRDFString;
}

function addAuthorsToRDF(document) {
  let string = '';
  let authorIndex = 1;
  while (document.data()['author_' + authorIndex]) {
      string += '<rdf:li> <foaf:Person> <foaf:surname>' + document.data()['author_' + authorIndex] + '</foaf:surname> </foaf:Person> </rdf:li>\n';
      authorIndex++;
  }
  
  return string;
}