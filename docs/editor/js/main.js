let displaySize = {
  width: 1280 * 2,
  height: 720 * 2,
};
const tabs = {
  elements: "Pole",
  attributes: "Hodnoty",
};
const selTab = (name) => {
  for (const tab in tabs) {
    const elTab = document.getElementById(`${tab}-header`);
    const elBody = document.getElementById(`${tab}-body`);
    if (!elTab || !elBody) {
      console.error(`Tab ${tab}-header ${tab}-body not found`);
      continue;
    }
    if (tab === name) {
      elTab.classList.add("active");
      elBody.style.display = "block";
    } else {
      elTab.classList.remove("active");
      elBody.style.display = "none";
    }
  }
};
let elPos = null;
const setPos = (x, y) => {
  if (!elPos) return;
  elPos.innerText = `X: ${x} Y: ${y}`;
  //   console.log("setPos", x, y);
};
const defaultAttrs = {
  X: 0,
  Y: 0,
  Width: 100,
  Height: 100,
  Rotation: 0,
  Scale: 1,
  Opacity: 1,
  ContentType: "Text",
  Content: "Hello World",
  Anchor: "Top-Left",
  Color: "#000000",
  BackgroundColor: "#ffffff",
  FontSize: "120%",
  FontFamily: "Arial",
  FontWeight: "normal",
};
const attrs = [
  "X",
  "Y",
  "Width",
  "Height",
  "Rotation",
  "Scale",
  "Opacity",
  "ContentType",
  "Content",
  "Anchor",
  "Color",
  "BackgroundColor",
  "FontSize",
  "FontFamily",
  "FontWeight",
];
const contentOptions = ["Text", "Image", "Video"];
const numberAttrs = [
  "X",
  "Y",
  "Width",
  "Height",
  "Rotation",
  "Scale",
  "Opacity",
];
const anchorOptions = [
  "Top-Left",
  "Top-Right",
  "Bottom-Left",
  "Bottom-Right",
  "Center",
];

const elNames = ["Text#1", "Image#1", "Video#1", "Text#2"];
let elAttrs = elNames.map((elName) => {
  return {
    X: 0,
    Y: 0,
    Width: 100,
    Height: 100,
    Rotation: 0,
    Scale: 1,
    Opacity: 1,
    ContentType: elName,
    Content: "Hello World",
    Anchor: "Top-Left",
    BackgroundColor: "#fff",
    Color: "#000",
    FontSize: "120%",
    FontFamily: "Arial",
    FontWeight: "normal",
  };
});
let sAttrs = window.localStorage.getItem("elAttrs");
if (sAttrs) {
  elAttrs = JSON.parse(sAttrs);
  console.log("elAttrs found in localStorage", elAttrs);
} else {
  console.log("No elAttrs found in localStorage");
  window.localStorage.setItem("elAttrs", JSON.stringify(elAttrs));
}
const saveElAttrs = () => {
  console.log("saveElAttrs", elAttrs);
  window.localStorage.setItem("elAttrs", JSON.stringify(elAttrs));
};
let selElement = 0;

const drawElemets = () => {
  const elScreen = document.getElementById("overlay-screen");
  if (!elScreen) {
    console.error("Element preview-screen not found");
    return;
  }
  elScreen.innerHTML = "";
  for (let ii = 0; ii < elAttrs.length; ii++) {
    const attr = elAttrs[ii];
    const elDiv = document.createElement("div");
    elDiv.className = "element";
    elDiv.id = `el-ovr-${ii}`;
    elDiv.style.width = `${attr.Width}px`;
    elDiv.style.height = `${attr.Height}px`;
    elDiv.style.position = "absolute";
    elDiv.style.left = `${attr.X}px`;
    elDiv.style.top = `${attr.Y}px`;
    elDiv.style.transform = `rotate(${attr.Rotation}deg) scale(${attr.Scale})`;
    elDiv.style.opacity = attr.Opacity;
    elDiv.style.backgroundColor = attr.BackgroundColor;
    elDiv.style.color = attr.Color;
    elDiv.style.fontSize = attr.FontSize;
    elDiv.style.fontFamily = attr.FontFamily;
    elDiv.style.fontWeight = attr.FontWeight;
    elDiv.innerText = attr.Content;
    elScreen.appendChild(elDiv);
  }
};
const createAttrs = (elBody) => {
  // create form for attributes
  const elForm = document.createElement("form");
  elForm.className = "attrs-form";
  elForm.id = "attrs-form";
  elForm.style.display = "flex";
  elForm.style.flexDirection = "column";
  elForm.style.width = "100%";
  elForm.style.height = "100%";
  elForm.style.overflow = "scroll";
  elForm.style.boxSizing = "border-box";
  elForm.style.padding = "10px";
  for (let attrIdx = 0; attrIdx < attrs.length; attrIdx++) {
    const attr = attrs[attrIdx];
    const elLabel = document.createElement("label");
    elLabel.innerText = attr;
    elForm.appendChild(elLabel);
    if (attr === "ContentType") {
      const elSelect = document.createElement("select");
      elSelect.id = attr;
      elSelect.name = attr;
      elSelect.style.width = "100%";
      elSelect.style.boxSizing = "border-box";
      elSelect.style.marginBottom = "5px";

      for (let jj = 0; jj < contentOptions.length; jj++) {
        const option = document.createElement("option");
        option.value = contentOptions[jj];
        option.innerText = contentOptions[jj];
        if (contentOptions[jj] === elAttrs[selElement][attr]) {
          option.selected = true;
        }
        elSelect.appendChild(option);
      }
      elSelect.addEventListener("change", (e) => {
        elAttrs[selElement].ContentType = e.target.value;
        saveElAttrs();
      });
      elForm.appendChild(elLabel);
      elForm.appendChild(elSelect);
      continue;
    } else if (attr === "Anchor") {
      // select one of top-left, top-right, bottom-left, bottom-right, center
      const elSelect = document.createElement("select");
      elSelect.id = attr;
      elSelect.name = attr;
      elSelect.style.width = "100%";
      elSelect.style.boxSizing = "border-box";
      elSelect.style.marginBottom = "5px";
      for (let jj = 0; jj < anchorOptions.length; jj++) {
        const option = document.createElement("option");
        option.value = anchorOptions[jj];
        option.innerText = anchorOptions[jj];
        if (anchorOptions[jj] === elAttrs[selElement][attr]) {
          option.selected = true;
        }
        elSelect.appendChild(option);
      }
      elSelect.addEventListener("change", (e) => {
        elAttrs[selElement].Anchor = e.target.value;
        saveElAttrs();
      });
      elForm.appendChild(elSelect);
    } else {
      const elInput = document.createElement("input");
      elInput.type = "text";
      elInput.id = attr;
      elInput.name = attr;
      elInput.style.width = "100%";
      elInput.style.boxSizing = "border-box";
      elInput.style.marginBottom = "5px";
      console.log(elAttrs, attrIdx, attr);
      elInput.value = elAttrs[selElement][attr];
      elInput.addEventListener("keyup", (e) => {
        const value = e.target.value;
        if (numberAttrs.includes(attr)) {
          if (isNaN(value)) {
            console.error(`Value ${value} is not a number`);
            return;
          }
          elAttrs[selElement][attr] = parseFloat(value);
        } else {
          elAttrs[selElement][attr] = value;
        }
        saveElAttrs();
        drawElemets();
      });
      elForm.appendChild(elInput);
    }
  }
  const elButton = document.createElement("button");
  elButton.type = "button";
  elButton.innerText = "Save";
  elButton.style.width = "100%";
  elButton.style.boxSizing = "border-box";
  elButton.style.marginBottom = "10px";
  elButton.style.padding = "10px";
  elButton.style.backgroundColor = "green";
  elButton.style.color = "white";
  elButton.style.border = "none";
  elButton.style.cursor = "pointer";
  elForm.appendChild(elButton);
  elBody.appendChild(elForm);
};
const updateAttrVals = () => {
  const elForm = document.getElementById("attrs-form");
  if (!elForm) {
    console.error("Element attrs-form not found");
    return;
  }
  for (let attrIdx = 0; attrIdx < attrs.length; attrIdx++) {
    const attr = attrs[attrIdx];
    const elInput = document.getElementById(attr);
    if (!elInput) {
      console.error(`Element ${attr} not found`);
      continue;
    }
    if (attr === "ContentType") {
    } else if (attr === "Anchor") {
    } else {
      elInput.value = elAttrs[selElement][attr];
    }
  }
};
const selEl = (idxSelected) => {
  selElement = idxSelected;
  // console.log("selEl", ii);
  const elNo = document.getElementById("el-no");
  if (!elNo) {
    console.error("Element el-no not found");
  } else {
    elNo.innerText = `#${idxSelected}`;
  }
  for (let jj = 0; jj < elNames.length; jj++) {
    const el = document.getElementById(`el-${jj}`);
    if (!el) {
      console.error(`Element el-${jj} or el-no not found`);
      continue;
    }
    console.log(el);
    if (jj === idxSelected) {
      el.classList.add("selected");
    } else {
      el.classList.remove("selected");
    }
  }
  updateAttrVals();
  selTab("attributes");
};
const createElements = (elBody) => {
  const elDivs = document.createElement("div");
  elDivs.className = "elements";
  for (let ii = 0; ii < elNames.length; ii++) {
    let elName = elNames[ii];
    const elDiv = document.createElement("div");
    elDiv.className = "element";
    elDiv.id = `el-${ii}`;
    elDiv.style.width = "100%";
    elDiv.innerText = elName;
    elDivs.appendChild(elDiv);
    elDiv.addEventListener("click", () => {
      // console.log("click", elName);
      selEl(ii);
    });
  }
  elBody.appendChild(elDivs);
  setTimeout(() => {
    selEl(0);
  }, 0);
};
const onLoad = () => {
  const elPreview = document.getElementById("preview");
  const elSide = document.getElementById("side");
  elSide.innerHTML = "";
  // create two tabs at the pop with container for each below
  const elTabs = document.createElement("div");
  elTabs.className = "tab-headers";
  const elBodies = document.createElement("div");
  elBodies.className = "tab-bodies";
  for (const tab in tabs) {
    console.log(tab, tabs[tab]);
    let elTab = document.createElement("div");
    elTab.className = "tab-header";
    elTab.id = `${tab}-header`;
    elTab.innerText = tabs[tab];
    elTabs.appendChild(elTab);
    elTab.addEventListener("click", () => {
      selTab(tab);
    });
    let elBody = document.createElement("div");
    elBody.className = "tab-body";
    elBody.id = `${tab}-body`;
    elBody.style.display = "none";
    let elH1 = document.createElement("h1");
    elH1.innerText = tabs[tab];
    elBody.appendChild(elH1);
    if (tab === "attributes") {
      elPos = document.createElement("div");
      elPos.className = "pos";
      elPos.innerText = "X: 0 Y: 0";
      elBody.appendChild(elPos);
      elNo = document.createElement("span");
      elNo.id = "el-no";
      elNo.innerText = `#${selElement}`;
      elH1.appendChild(elNo);
      createAttrs(elBody);
    } else {
      createElements(elBody);
    }
    elBodies.appendChild(elBody);
  }
  setTimeout(() => {
    selTab("attributes");
  }, 0);
  elSide.appendChild(elTabs);
  elSide.appendChild(elBodies);
  // add preview element set it to display size and zoom to fit into preview container
  let elScreen = document.createElement("div");
  elScreen.className = "preview-screen";
  const aw = elPreview.clientWidth - 20;
  const ah = elPreview.clientHeight - 20;
  const scale = Math.min(
    aw / displaySize.width, //* window.devicePixelRatio,
    aw / displaySize.height //* window.devicePixelRatio
  );
  console.log(
    elScreen.style.transform,
    `pWxH:${elPreview.clientWidth}x${elPreview.clientHeight}`,
    `dWxH:${displaySize.width}x${displaySize.height}`,
    "rw",
    elPreview.clientWidth / displaySize.width,
    "rh",
    elPreview.clientHeight / displaySize.height
  );
  elScreen.style.width = `${displaySize.width}px`;
  elScreen.style.height = `${displaySize.height}px`;
  elScreen.style.transform = `scale(${scale})`;
  elScreen.style.transformOrigin = "top left";
  elScreen.style.overflow = "scroll";
  //   elScreen.style.position = "absolute";
  elScreen.style.position = "relative";
  elScreen.style.top = "0px";
  elScreen.style.left = "0px";
  elScreen.style.backgroundColor = "navy";
  elScreen.style.zIndex = "10";
  elScreen.style.border = "1px solid red";
  elScreen.style.boxSizing = "border-box";
  elPreview.appendChild(elScreen);
  elScreen.addEventListener("mousedown", (e) => {
    // console.log("mousedown", e.clientX, e.clientY);
    const x = Math.floor(e.clientX / scale);
    const y = Math.floor(e.clientY / scale);
    setPos(x, y);
  });
  elOverlay = document.createElement("div");
  elOverlay.id = "overlay-screen";
  elOverlay.className = "overlay-screen";
  elOverlay.style.width = `${displaySize.width}px`;
  elOverlay.style.height = `${displaySize.height}px`;
  elOverlay.style.transform = `scale(${scale})`;
  elOverlay.style.transformOrigin = "top left";
  elPreview.appendChild(elOverlay);
  drawElemets();
};
window.addEventListener("load", onLoad);
