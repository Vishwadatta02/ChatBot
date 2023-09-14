const answerElement = document.getElementById("answer");
const sourceDocElement = document.getElementById("sourceDoc");
const sourceDocLinkElement = document.getElementById("sourceDocLink");
const sourceDocTableElement = document.getElementById("sourceDocTable");
const docImageElement = document.getElementById("docImage");
const docImageTextElement = document.getElementById("docImageText");
const thumbsDownButton = document.getElementById("thumbsDownButton");
const responseContainer = document.getElementById("responseContainer");
const loadingContainer = document.getElementById("loadingContainer");
const moreDetailsBtn = document.getElementById("moreDetails");
let currentApiNumber = 1; // Initialize with 1
const baseApiUrl = "http://w5800.corp.skf.net:8000/";
// override for test
//baseApiUrl = "http://192.168.2.127:8000/";

//loading logic
let loadingTimeout;

function showLoading() {
    loadingContainer.classList.remove("d-none");
    responseContainer.classList.add("d-none");
        
}

function hideLoading() {
    loadingContainer.classList.add("d-none");
    responseContainer.classList.remove("d-none");
    
    // Clear the loading timeout
    clearTimeout(loadingTimeout);
    
    // Hide the server not responding message
    serverNotRespondingMessage.classList.add("d-none");
     
    updateSuggestions()
}
    
function fetchAndUpdate(apiUrl) {
    showLoading();    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            answerElement.textContent = data.answer;
            if (isJSON(data.source_doc)) {
                displayJSONAsTable(data.source_doc);
            } else {
                sourceDocLinkElement.textContent = data.source_doc;
            }
            sourceDocLinkElement.href = data.source_doc_link;
            docImageElement.src = data.doc_image;
            hideLoading();
        })
        .catch(error => {
            console.error("Error:", error);
            loadingContainer.classList.add("d-none");
            
            serverNotRespondingMessage.classList.remove("d-none");
        });
}

function isJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

function displayJSONAsTable(jsonStr) {
    const tableElement = document.getElementById("sourceDocTable");
    const jsonData = JSON.parse(jsonStr);

    let tableHTML = "<tr>";

    // Create table headers based on the keys of the first object
    for (const key in jsonData[0]) {
        tableHTML += `<th>${key.replace(/_/g, " ")}</th>`;
    }

    tableHTML += "</tr>";

    // Create rows for each object's properties
    for (const obj of jsonData) {
        tableHTML += "<tr>";
        for (const key in obj) {
            tableHTML += `<td>${obj[key]}</td>`;
        }
        tableHTML += "</tr>";
    }

    tableElement.innerHTML = tableHTML;
}   

//Submit handler
function submitAction() {
    currentApiNumber = 1;
    var inputText = document.getElementById("inputText").value;

    var encodedText = encodeURIComponent(inputText).replace("%2F","zskfspecialreplace");
    if (inputText.includes("order") || inputText.includes("auftrag") || inputText.includes("bestellung") || inputText.includes("purchase")) {
        apiUrl = baseApiUrl + "ordinfo/" + encodedText;
        docImageElement.classList.add("d-none");
        docImageTextElement.classList.add("d-none");
        commentContainer.classList.add("d-none");
        sourceDocTableElement.classList.remove("d-none");
        sourceDocElement.classList.add("d-none");
        thumbsDownButton.classList.add("d-none");
        moreDetailsBtn.classList.remove("d-none");
    } else {
        //API URL: geninfo/[QUERY]/[TOP_N]/ 
        //API Request type: GET 
        apiUrl = baseApiUrl + "geninfo/" + encodedText + "/" + 1 + "/";
        docImageElement.classList.remove("d-none");
        docImageTextElement.classList.remove("d-none");
        sourceDocTableElement.classList.add("d-none");
        thumbsDownButton.classList.remove("d-none");
        sourceDocElement.classList.remove("d-none");
    }
    fetchAndUpdate(apiUrl);
}

document.getElementById("submitButton").addEventListener("click", submitAction);

document.getElementById("inputText").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        submitAction();
    }
});

thumbsDownButton.addEventListener("click", function() {
    commentContainer.classList.remove("d-none"); // Show the comment input and button

    document.getElementById("sendCommentButton").addEventListener("click", function() {
        var inputText = document.getElementById("inputText").value;
        var encodedText = encodeURIComponent(inputText).replace("%2F", "zskfspecialreplace");
        var comment = encodeURIComponent(document.getElementById("commentInput").value).replace("%2F", "zskfspecialreplace");
        currentApiNumber++;
        var newApiUrl = baseApiUrl + "geninfo/" + encodedText + "/" + currentApiNumber + "/" + comment;
        commentContainer.classList.add("d-none");

        fetchAndUpdate(newApiUrl);
    });
});
moreDetailsBtn.addEventListener("click",function(){
    //api call for more details or download the details file.

});


const questions = {
    "JM": [
        "What is maximum pressure",
        "What is the functioning principle",
        "Number of outlets",
        "Operating temperature",
        "Drive details"
    ],
    // Add more categories and questions as needed
};

// Function to update the suggestions based on user input
async function updateSuggestions() {
    const searchInput = document.getElementById("inputText").value;
    const suggestions = document.getElementById("suggestions");
    
    // Clear previous suggestions
    suggestions.innerHTML = '';

    // Iterate through the categories (keys) in the 'questions' object
    for (const category in questions) {
        // Check if the category (key) is included in the input text
        if (searchInput.includes(category)) {
            // Display the suggested questions for the matching category
            questions[category].forEach(question => {
                const listItem = document.createElement('li');
                listItem.textContent = question;
                listItem.className = 'listItemClass';
                listItem.addEventListener('click', () => {
                    // When a suggestion is clicked, populate the search bar with the suggestion text
                    document.getElementById("inputText").value = question;
                    suggestions.innerHTML = ''; // Clear suggestions
                });
                suggestions.appendChild(listItem);
            });
        }
    }
    document.getElementById('suggestionsContainer').classList.remove("d-none");
}              