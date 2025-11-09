// === UI PANEL ===
export function createAddRemoveUI({ decorations, toggleDecoration }) {
  const ui = document.createElement('div');
  ui.style.position = 'absolute';
  ui.style.top = '12px';
  ui.style.left = '12px';
  ui.style.display = 'grid';
  ui.style.gap = '8px';
  ui.style.padding = '8px';
  ui.style.background = 'rgba(0,0,0,0.35)';
  ui.style.borderRadius = '10px';
  ui.style.color = '#e8e8e8';
  ui.style.fontFamily = 'system-ui, Arial, sans-serif';

  const btns = {};

  function makeButton(key, label) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.padding = '10px 12px';
    btn.style.background = '#2d2f36';
    btn.style.border = '1px solid #3a3d45';
    btn.style.color = '#e8e8e8';
    btn.style.borderRadius = '8px';
    btn.style.cursor = 'pointer';
    btn.onclick = () => toggleDecoration(key);
    btns[key] = btn;
    return btn;
  }

  // --- Buttons ---
  ui.appendChild(makeButton('strawberry', 'Add Strawberry'));
  ui.appendChild(makeButton('orchid', 'Add Orchid'));
  ui.appendChild(makeButton('chocolate', 'Add Chocolate'));
  document.getElementById('app').appendChild(ui);

  // --- Button helpers ---
  function updateButton(key) {
    const item = decorations[key];
    const btn = btns[key];
    if (!btn) return;
    btn.textContent = item.mesh ? `Remove ${capitalize(key)}` : `Add ${capitalize(key)}`;
  }

  function setDisabled(key, disabled, labelIfDisabled = '') {
    const btn = btns[key];
    if (!btn) return;
    btn.disabled = !!disabled;
    if (disabled) {
      if (labelIfDisabled) btn.textContent = labelIfDisabled;
      btn.style.opacity = '0.6';
      btn.style.cursor = 'not-allowed';
    } else {
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      updateButton(key);
    }
  }

  return { updateButton, setDisabled };
}

export function createEditPanel({ decorations, tcontrols, dropToCake }) {
  const editPanel = document.createElement('div');
  editPanel.style.position = 'absolute';
  editPanel.style.top = '12px';
  editPanel.style.right = '12px';
  editPanel.style.padding = '10px';
  editPanel.style.background = 'rgba(0,0,0,0.35)';
  editPanel.style.borderRadius = '10px';
  editPanel.style.color = '#e8e8e8';
  editPanel.style.fontFamily = 'system-ui, Arial, sans-serif';
  editPanel.innerHTML = `
    <div style="margin-bottom:6px; font-weight:600;">Edit decoration</div>
    <label style="display:block; margin-bottom:6px;">
      Pick:
      <select id="editSelect" style="margin-left:6px;">
        <option value="">— none —</option>
        <option value="strawberry">Strawberry</option>
        <option value="orchid">Orchid</option>
        <option value="chocolate">Chocolate</option>
      </select>
    </label>
    <label style="display:block; margin:8px 0;">
      Scale: <input id="scaleRange" type="range" min="0.5" max="2.0" step="0.01" value="1" />
    </label>
    <button id="moveToggle" style="width:100%; padding:6px 8px; background:#2d2f36; border:1px solid #3a3d45; color:#e8e8e8; border-radius:8px; cursor:pointer;">Enable Move</button>
  `;
  document.getElementById('app').appendChild(editPanel);

  const editSelect = editPanel.querySelector('#editSelect');
  const scaleRange = editPanel.querySelector('#scaleRange');
  const moveToggle = editPanel.querySelector('#moveToggle');
  let selectedKey = '';

  editSelect.onchange = () => {
    selectedKey = editSelect.value;
    const item = decorations[selectedKey];
    if (item && item.mesh) {
      tcontrols.attach(item.mesh);
      moveToggle.textContent = 'Disable Move';
      scaleRange.value = '1';
    } else {
      tcontrols.detach();
      moveToggle.textContent = 'Enable Move';
    }
  };

  scaleRange.oninput = () => {
    const item = decorations[selectedKey];
    if (item && item.mesh) {
      const s = parseFloat(scaleRange.value);
      item.mesh.scale.setScalar(s * item.mesh.scale.x);
      dropToCake(item.mesh);
      scaleRange.value = '1';
    }
  };

  moveToggle.onclick = () => {
    const item = decorations[selectedKey];
    if (!item || !item.mesh) return;
    if (tcontrols.object) {
      tcontrols.detach();
      moveToggle.textContent = 'Enable Move';
    } else {
      tcontrols.attach(item.mesh);
      moveToggle.textContent = 'Disable Move';
    }
  };
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
