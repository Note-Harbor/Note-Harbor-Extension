const toolbarOptions = ["bold", "italic", "underline", "strike"];

const options = {
  theme: "snow",
  placeholder: "Write Here!",
  modules: {
    toolbar: "#formatBar"
  }
};
const mainQuill = new Quill("#info", options);