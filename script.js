let dictionary = {};

// Load dictionary.json with cache-busting (important for GitHub Pages)
fetch("dictionary.json?v=" + Date.now())
  .then(res => res.json())
  .then(data => {
    dictionary = data;
    console.log("✅ Dictionary loaded:", dictionary);
  })
  .catch(err => console.error("Failed to load dictionary:", err));

// Unicode normalize helper (like Python's NFC)
function normalizeText(str) {
  return str.normalize("NFC");
}

// Replace function
function replaceText() {
  let input = document.getElementById("inputText").value;
  let output = normalizeText(input);

  for (const [oldWord, newWord] of Object.entries(dictionary)) {
    let oldNorm = normalizeText(oldWord);
    let newNorm = normalizeText(newWord);
    output = output.split(oldNorm).join(newNorm); // safer than regex
  }

  document.getElementById("outputText").value = output;
}
