export function setupUI(particleSystem, onExportVideo) {
    const container = document.createElement('div');
    container.id = 'ui-container';

    const createControl = (label, type, key, min, max, step, value) => {
        const group = document.createElement('div');
        group.className = 'control-group';

        const labelEl = document.createElement('label');
        labelEl.textContent = label;

        const input = document.createElement('input');
        input.type = type;
        if (type === 'range') {
            input.min = min;
            input.max = max;
            input.step = step;
        }
        input.value = value;

        input.addEventListener('input', (e) => {
            let val = e.target.value;
            if (type === 'range') val = parseFloat(val);
            particleSystem.updateParams(key, val);
        });

        group.appendChild(labelEl);
        group.appendChild(input);
        return group;
    };

    container.appendChild(createControl('Particle Count', 'range', 'count', 100, 50000, 100, particleSystem.params.count));
    container.appendChild(createControl('Size', 'range', 'size', 0.1, 5, 0.1, particleSystem.params.size));
    container.appendChild(createControl('Speed', 'range', 'speed', 0, 5, 0.1, particleSystem.params.speed));
    container.appendChild(createControl('Radius', 'range', 'radius', 1, 50, 1, particleSystem.params.radius));
    container.appendChild(createControl('Color', 'color', 'color', null, null, null, particleSystem.params.color));

    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Video (.webm)';
    exportBtn.onclick = onExportVideo;
    container.appendChild(exportBtn);

    const exportConfigBtn = document.createElement('button');
    exportConfigBtn.textContent = 'Export Config (JSON)';
    exportConfigBtn.className = 'secondary';
    exportConfigBtn.onclick = () => {
        const data = JSON.stringify(particleSystem.params, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'particle-config.json';
        a.click();
        URL.revokeObjectURL(url);
    };
    container.appendChild(exportConfigBtn);

    document.body.appendChild(container);
}
