//Structures
import Field from "./Model/field";
import { setupSelectTemplate, formatData } from "./formatter";

//Libraries
const fs = require("fs");
const { remote } = require("electron");

//DOMs
const fieldsContainer = document.getElementById("field-container");
const fieldTemplate = document.getElementById("field-template");
if (fieldTemplate)
  setupSelectTemplate(fieldTemplate.querySelector(
    "#format"
  ) as HTMLSelectElement);

let fields: Field[] = [];
let selectedFile: string = "";
let previewInputData: string[][] = [];

//minimize window
const onMinimizeButtonClick = () => {
  const window = remote.getCurrentWindow();
  window.minimize();
};

//close window
const onCloseButtonClick = () => {
  const window = remote.getCurrentWindow();
  window.close();
};

const onAddFieldClick = () => {
  if (!fieldsContainer || !fieldTemplate) return;

  //Field Element
  const newField = fieldTemplate.cloneNode(true) as HTMLElement;
  fieldsContainer.appendChild(newField);
  newField.style.display = "block";

  //Field Data
  const f: Field = {
    Heading: "",
    Column: 0,
    Row: 0,
    formatIndex: 0,
    Elem: newField
  };

  //Field Events
  setupFieldEvents(newField, f);

  //Store Data
  fields.push(f);
};

const onSaveFieldsClick = () => {
  const fileSavePath = remote.dialog.showSaveDialog({
    filters: [
      {
        name: "Field Data File (.json)",
        extensions: ["json"]
      }
    ]
  });
  if (!fileSavePath) return;
  const rawFieldsData = JSON.stringify({
    fields: fields
  });
  fs.writeFileSync(fileSavePath, rawFieldsData, { encoding: "utf8" });
};

const onLoadFieldsClick = () => {
  const filePath = remote.dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      {
        name: "Field Data File (.json)",
        extensions: ["json"]
      }
    ]
  });
  if (!filePath) return;
  const fieldsData = JSON.parse(
    fs.readFileSync(filePath[0], { encoding: "utf8" })
  );

  if (!fieldsContainer || !fieldTemplate) return;

  for (let i = 0; i < fields.length; i++) {
    fields[i].Elem.remove();
  }
  fields = fieldsData.fields;
  for (let i = 0; i < fields.length; i++) {
    const newField = fieldTemplate.cloneNode(true) as HTMLElement;
    fieldsContainer.appendChild(newField);
    newField.style.display = "block";
    fields[i].Elem = newField;

    setupFieldEvents(newField, fields[i]);
  }
};

const onSaveFieldsOnlineClick = () => {
};

const onLoadFieldsOnlineClick = () => {
};

const onCreatePipeDelimitedFile = () => {
  if (!selectedFile || selectedFile.length < 1) {
    alert("Please select a data file first!");
    return;
  }
  if (fields.length < 1) {
    alert("No fields selected, Data will be empty!");
    return;
  }
  const saveLocation = remote.dialog.showSaveDialog({
    filters: [
      {
        name: "Data File",
        extensions: ["txt", "csv"]
      },
      {
        name: "All Files",
        extensions: ["*"]
      }
    ]
  });

  let outputData = "";
  for (let i = 0; i < fields.length; i++) {
    outputData += fields[i].Heading;

    if (i + 1 != fields.length) {
      outputData += "|"
    }
  }
  outputData += "\n";

  const inputData: string = fs.readFileSync(selectedFile[0], {
    encoding: "utf8"
  });
  const records = inputData.split("DOCHEADER");
  for (let i = 1; i < records.length; i++) {
    const lines = records[i].split("\n");
    for (let j = 0; j < fields.length; j++) {
      const rows = lines[fields[j].Column].split("|");
      outputData +=
        formatData(rows[fields[j].Row], fields[j].formatIndex);

      if (j + 1 != fields.length) {
        outputData += "|";
      }
    }
    outputData += "\n";
  }

  fs.writeFileSync(saveLocation, outputData, { encoding: "utf8" });
};

const onSelectFile = () => {
  selectedFile = remote.dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      {
        name: "Data File",
        extensions: ["txt", "csv"]
      },
      {
        name: "All Files",
        extensions: ["*"]
      }
    ]
  });

  if (!selectedFile && selectedFile.length < 1) return;

  const singleRecord = fs
    .readFileSync(selectedFile[0], { encoding: "utf8" })
    .split("DOCHEADER")[1];
  if (!singleRecord) {
    alert("Could not find any records in this file :c");
    selectedFile = "";
    return;
  }

  previewInputData = [];
  const columns = singleRecord.split("\n");
  for (let i = 0; i < columns.length; i++) {
    const rows = columns[i].split("|");
    previewInputData[i] = [];
    for (let j = 0; j < rows.length; j++) {
      previewInputData[i][j] = rows[j];
    }
  }
};

const updateFieldPreview = (newField: HTMLElement, f: Field) => {
  if (!previewInputData) return;
  if (!previewInputData[f.Column]) return;
  if (!previewInputData[f.Column][f.Row]) return;

  const newFieldPreview = newField.querySelector("#preview") as HTMLSpanElement;
  newFieldPreview.innerHTML = formatData(
    previewInputData[f.Column][f.Row],
    f.formatIndex
  );
};

const setupFieldEvents = (newField: HTMLElement, f: Field) => {
  const closeButton = newField.querySelector(
    "#close-button"
  ) as HTMLButtonElement;
  if (closeButton) {
    closeButton.onclick = () => {
      newField.remove();
      fields.slice(fields.indexOf(f));
    };
  }
  const header = newField.querySelector("#header") as HTMLInputElement;
  header.value = f.Heading;
  if (header) {
    header.onchange = () => {
      f.Heading = header.value;
    };
  }

  const column = newField.querySelector("#column") as HTMLInputElement;
  column.value = f.Column.toString();
  if (column) {
    column.oninput = () => {
      if (
        column.value == null ||
        column.value == undefined ||
        Number.parseInt(column.value) < 0
      ) {
        f.Column = 0;
        return;
      }
      f.Column = Number.parseInt(column.value);
      updateFieldPreview(newField, f);
    };
  }

  const row = newField.querySelector("#row") as HTMLInputElement;
  row.value = f.Row.toString();
  if (row) {
    row.oninput = () => {
      if (
        row.value == null ||
        row.value == undefined ||
        Number.parseInt(row.value) < 0
      ) {
        f.Row = 0;
        return;
      }
      f.Row = Number.parseInt(row.value);
      updateFieldPreview(newField, f);
    };
  }

  const select = newField.querySelector("#format") as HTMLSelectElement;
  select.selectedIndex = f.formatIndex;
  select.onchange = () => {
    f.formatIndex = select.selectedIndex;
    updateFieldPreview(newField, f);
  };
};
