console.log("en el script");

function pushExample (){
    var exampleVar = document.getElementById("example").value;
    console.log(exampleVar);
    var row = document.getElementById("exampleRow");
    var cell1 = row.insertCell(0);
    cell1.innerHTML = exampleVar;

    document.getElementById("deleteButton").style.display = "block";


}

var wordCount = 0;
function pushLemma(){

    var table = document.getElementById("wordTable");
    wordCount++;
    var row = table.insertRow(0);
    var value1 = document.getElementById('word').value;
    var exceptionalForm = document.getElementById('form').value;

    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);

    cell1.innerHTML = wordCount;
    cell2.innerHTML = value1;
    cell3.innerHTML = exceptionalForm;

    document.getElementById('form').value = "";
    document.getElementById('word').value = "";
}

var x = document.getElementById('myDIV');


function yesnoCheck() {
    if (document.getElementById('no_GAP').checked) {
        document.getElementById('myDIV').style.display = 'block';
        document.getElementById('myPOS').style.display = 'block';

    }
    else {
        document.getElementById('myPOS').style.display = 'none';
        document.getElementById('myDIV').style.display = 'none';
    }

}

function submitForm(){
    console.log("congratulations");
    
}
