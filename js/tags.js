const tagContainer = document.getElementById("tagRow");
const addTag = document.getElementById("addTagButton");

addTag.addEventListener("click", insertTag);

function insertTag() {
    // tag as wrapper, tag-input for inputs, del-tag for delete button to avoid any editable issues
    const tag = document.createElement("div");
    tag.className = "new-tag";

    const tagInput = document.createElement("div");
    tagInput.className = "tag-input";
    tagInput.contentEditable = true;
    tagInput.textContent = "";

    tagInput.addEventListener("focus", function() {
        if (tagInput.textContent.trim() === "") {
            tagInput.textContent = "";
        }
        tag.className = "tag";
        tagInput.style.marginRight = "7px";
        deleteButton.style.display = "block";
    });

    tagInput.addEventListener("blur", function() {
        if (tagInput.textContent.trim() === "") {
            tagInput.textContent = ""; 
            tag.className = "new-tag"; // reset to new-tag if text is empty
        }
        tagInput.style.marginRight = "0px";
        deleteButton.style.display = "none";
    });

    tagInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); //prevent new-line
        }
    });

    tagInput.addEventListener("input", function() {
        if (tagInput.textContent.trim() !== "") {
            tag.className = "tag";
        } else {
            tag.className = "new-tag";
        }
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "del-tag";
    deleteButton.textContent = "x";
    deleteButton.addEventListener("click", function(event) {
        event.stopPropagation();
        tag.remove();
    });

    deleteButton.addEventListener("mousedown", function(event) {
        event.preventDefault(); // prevent blur on click
    });

    tag.appendChild(tagInput);
    tag.appendChild(deleteButton);

    tagContainer.appendChild(tag);

    // automatically focus on new tag input
    tagInput.focus();
}
