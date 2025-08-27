let baseDictionary = {};
let customDictionary = {};
let dictionary = {};
let processedText = "";
let currentMode = "both"; // default

// Load base dictionary.json
fetch("dictionary.json?v=" + Date.now())
  .then(res => res.json())
  .then(data => {
    baseDictionary = data;

    // Load saved custom dictionary from localStorage
    const savedDict = localStorage.getItem("customDictionary");
    if (savedDict) {
      customDictionary = JSON.parse(savedDict);
      console.log("📑 Restored custom dictionary:", customDictionary);
    }

    rebuildDictionary();
  })
  .catch(err => console.error("❌ Failed to load dictionary:", err));

// Normalize Unicode
function normalizeText(str) {
  return str.normalize("NFC");
}

// Rebuild dictionary based on mode
function rebuildDictionary() {
  if (currentMode === "default") {
    dictionary = { ...baseDictionary };
  } else if (currentMode === "custom") {
    dictionary = { ...customDictionary };
  } else {
    dictionary = { ...baseDictionary, ...customDictionary };
  }
  console.log(`✅ Dictionary rebuilt (mode: ${currentMode})`, dictionary);
}

// Update mode when user changes selection
function updateDictionaryMode() {
  currentMode = document.getElementById("dictMode").value;
  rebuildDictionary();
  alert(`🔄 Switched to "${currentMode}" mode`);
}

// Replace logic
function doReplace(input) {
  let output = normalizeText(input);
  for (const [oldWord, newWord] of Object.entries(dictionary)) {
    let oldNorm = normalizeText(oldWord);
    let newNorm = normalizeText(newWord);
    output = output.split(oldNorm).join(newNorm);
  }
  return output;
}

// Replace textarea content
function replaceText() {
  let input = document.getElementById("inputText").value;
  processedText = doReplace(input);
  document.getElementById("outputText").value = processedText;
}

// Process uploaded .txt file
function processFile() {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) {
    alert("Please select a .txt file first.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const text = e.target.result;
    processedText = doReplace(text);
    document.getElementById("outputText").value = processedText;
    alert("✅ File processed successfully!");
  };

  reader.readAsText(file, "UTF-8");
}

// Download processed text
function downloadFile() {
  if (!processedText) {
    alert("Please process some text first!");
    return;
  }

  const blob = new Blob([processedText], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "corrected.txt";
  link.click();
}

// Upload CSV and merge into custom dictionary
function uploadCSV() {
  const csvInput = document.getElementById("csvInput");
  if (!csvInput.files.length) {
    alert("Please select a .csv file first.");
    return;
  }

  const file = csvInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const text = e.target.result;
    const rows = text.split(/\r?\n/);

    let newEntries = 0;
    rows.forEach(row => {
      const [oldWord, newWord] = row.split(",");
      if (oldWord && newWord) {
        customDictionary[normalizeText(oldWord.trim())] = normalizeText(newWord.trim());
        newEntries++;
      }
    });

    localStorage.setItem("customDictionary", JSON.stringify(customDictionary));
    rebuildDictionary();

    alert(`✅ Uploaded ${newEntries} new dictionary entries (saved in browser)`);
  };

  reader.readAsText(file, "UTF-8");
}

// Clear custom dictionary from localStorage
function clearCustomDict() {
  customDictionary = {};
  localStorage.removeItem("customDictionary");
  rebuildDictionary();
  alert("🗑️ Custom dictionary cleared. Reload page to reset.");
}
