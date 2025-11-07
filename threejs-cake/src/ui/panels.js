export function createAddRemoveUI({ decorations, toggleDecoration, updateButtonText, mountId = 'app' }) {
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
  
    ui.appendChild(makeButton('strawberry', 'Add Strawberry'));
    ui.appendChild(makeButton('candle', 'Add Candle'));
    ui.appendChild(makeButton('chocolate', 'Add Chocolate'));
    document.getElementById(mountId).appendChild(ui);
  
    function updateButton(key) {
      const item = decorations[key];
      const btn = btns[key];
      if (!btn) return;
      btn.textContent = item.mesh ? `Remove ${cap(key)}` : `Add ${cap(key)}`;
    }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  
    // expose a function for main.js
    return { updateButton };
  }
  
  export function createEditPanel({ decorations, tcontrols, dropToCake, controls, mountId = 'app' }) {
    const panel = document.createElement('div');
    panel.style.position = 'absolute';
    panel.style.top = '12px';
    panel.style.right = '12px';
    panel.style.padding = '10px';
    panel.style.background = 'rgba(0,0,0,0.35)';
    panel.style.borderRadius = '10px';
    panel.style.color = '#e8e8e8';
    panel.style.fontFamily = 'system-ui, Arial, sans-serif';
    panel.innerHTML = `
      <div style="margin-bottom:6px; font-weight:600;">Edit decoration</div>
      <label style="display:block; margin-bottom:6px;">
        Pick:
        <select id="editSelect" style="margin-left:6px;">
          <option value="">— none —</option>
          <option value="strawberry">Strawberry</option>
          <option value="candle">Candle</option>
          <option value="chocolate">Chocolate</option>
        </select>
      </label>
      <label style="display:block; margin:8px 0;">
        Scale: <input id="scaleRange" type="range" min="0.5" max="2.0" step="0.01" value="1" />
      </label>
      <button id="moveToggle" style="width:100%; padding:6px 8px; background:#2d2f36; border:1px solid #3a3d45; color:#e8e8e8; border-radius:8px; cursor:pointer;">Enable Move</button>
    `;
    document.getElementById(mountId).appendChild(panel);
  
    const editSelect = panel.querySelector('#editSelect');
    const scaleRange = panel.querySelector('#scaleRange');
    const moveToggle = panel.querySelector('#moveToggle');
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
  