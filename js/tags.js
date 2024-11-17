const tagContainer = document.getElementById("tagRow");

// Insert empty tag to tagContainer
function insertTag() {
    const tag = document.createElement("div");
    tag.className = "new-tag";
    tag.contentEditable = "plaintext-only";
    tag.textContent = "New Tag";

    // If user press enter, create new tag
    tag.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            tag.className = "tag";
            tag.contentEditable = false;
            tag.removeEventListener("keydown", this);

            const deleteButton = document.createElement("button");
            deleteButton.className = "del";
            deleteButton.textContent = "x";
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

            insertTag();
        }
    });

    tagContainer.appendChild(tag);
}



