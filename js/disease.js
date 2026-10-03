/* ============================================================
   DISEASE.JS — Crop Disease Detection UI (DEMO ONLY)
   No real image analysis happens here.
   FUTURE: send the uploaded image file to
     fetch(`${AGRI.api.base}/ai/disease`, { method:'POST', body: formData })
   where a real trained image-classification model would run.
   ============================================================ */

function initDiseaseUpload() {
  const input = document.getElementById('diseaseImageInput');
  const dropZone = document.getElementById('diseaseDropZone');
  const preview = document.getElementById('diseasePreview');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const resultBox = document.getElementById('diseaseResult');
  if (!input) return;

  let fileSelected = false;

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      AGRI.toast('Please choose an image file.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Uploaded crop photo" style="border-radius:14px;max-height:280px;margin:0 auto;">`;
      fileSelected = true;
      analyzeBtn.disabled = false;
      resultBox.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  input.addEventListener('change', () => handleFile(input.files[0]));

  ['dragover', 'dragleave', 'drop'].forEach(evt => {
    dropZone.addEventListener(evt, (e) => e.preventDefault());
  });
  dropZone.addEventListener('dragover', () => dropZone.style.borderColor = 'var(--leaf-600)');
  dropZone.addEventListener('dragleave', () => dropZone.style.borderColor = '');
  dropZone.addEventListener('drop', (e) => {
    dropZone.style.borderColor = '';
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  analyzeBtn.addEventListener('click', () => {
    if (!fileSelected) return;
    resultBox.innerHTML = `<div class="skeleton" style="height:120px;"></div>`;
    resultBox.style.display = 'block';

    setTimeout(() => {
      resultBox.innerHTML = `
        <div class="card" style="border-color:var(--terracotta-500);">
          <span class="badge badge-danger">Demo Result</span>
          <h3 style="margin:12px 0 6px;">Possible Disease: Leaf Spot</h3>
          <p><strong>Confidence: 87%</strong></p>
          <p class="text-muted">Suggested Action: Consult an agricultural expert and monitor affected plants closely over the next few days.</p>
          <p class="field-hint" style="margin-top:10px;">⚠️ This result is generated from mock/demo logic, not a real image-recognition model.</p>
        </div>`;
    }, 900);
  });
}

document.addEventListener('DOMContentLoaded', initDiseaseUpload);
