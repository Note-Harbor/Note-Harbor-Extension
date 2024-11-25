const tagContainer = document.getElementById("tagRow");
const addTag = document.getElementById("addTagButton");

addTag.addEventListener("click", insertTag);

function insertTag() {
    const tag = document.createElement("div");
    tag.className = "new-tag";
    tag.contentEditable = true;
    tag.textContent = "";

    tag.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();  // prevent adding newline 
        }
    });

    tag.addEventListener("input", function() {
        const text = tag.innerText.trim(); 
        if (text !== "") {
            if (tag.className !== "tag") {
                tag.className = "tag";  
            }
        } else {
            if (tag.className !== "new-tag") {
                tag.className = "new-tag";  
            }
        }
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "del";
    deleteButton.textContent = "x";
    // deleteButton.contentEditable = false;
    deleteButton.style.display = "none";
    deleteButton.addEventListener("click", function(event) {
        event.stopPropagation();
        tag.remove();
    });

    tag.addEventListener("mouseover", function() {
        deleteButton.style.display = "block";
    });

    tag.addEventListener("mouseout", function() {
        deleteButton.style.display = "none";
    });

    tag.appendChild(deleteButton);

    tagContainer.appendChild(tag);
}



