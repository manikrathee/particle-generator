import GUI from 'lil-gui';

export function setupUI(particleSystem, onExportVideo, bloomPass) {
    const gui = new GUI({ title: 'Particle Generator' });

    // Particles Folder
    const particleFolder = gui.addFolder('Particles');

    particleFolder.add(particleSystem.params, 'count', 100, 50000, 100)
        .name('Count')
        .onChange(v => particleSystem.updateParams('count', v));

    particleFolder.add(particleSystem.params, 'size', 0.1, 5, 0.1)
        .name('Size')
        .onChange(v => particleSystem.updateParams('size', v));

    particleFolder.add(particleSystem.params, 'speed', 0, 5, 0.1)
        .name('Speed')
        .onChange(v => particleSystem.updateParams('speed', v));

    particleFolder.add(particleSystem.params, 'radius', 1, 50, 1)
        .name('Radius')
        .onChange(v => particleSystem.updateParams('radius', v));

    particleFolder.addColor(particleSystem.params, 'color')
        .name('Color')
        .onChange(v => particleSystem.updateParams('color', v));

    particleFolder.add(particleSystem.params, 'randomness', 0, 2, 0.01)
        .name('Randomness')
        .onChange(v => particleSystem.updateParams('randomness', v));

    particleFolder.add(particleSystem.params, 'shape', { Circle: 0, Square: 1, Ring: 2 })
        .name('Shape')
        .onChange(v => particleSystem.updateParams('shape', v));

    // Post Processing Folder
    if (bloomPass) {
        const bloomFolder = gui.addFolder('Post Processing');
        bloomFolder.add(bloomPass, 'strength', 0, 3, 0.01).name('Bloom Strength');
        bloomFolder.add(bloomPass, 'radius', 0, 1, 0.01).name('Bloom Radius');
        bloomFolder.add(bloomPass, 'threshold', 0, 1, 0.01).name('Bloom Threshold');
    }

    // Export Folder
    const exportFolder = gui.addFolder('Export');

    const exportParams = {
        exportVideo: onExportVideo,
        exportConfig: () => {
            const data = JSON.stringify(particleSystem.params, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'particle-config.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    exportFolder.add(exportParams, 'exportVideo').name('Export Video (.webm)');
    exportFolder.add(exportParams, 'exportConfig').name('Export Config (JSON)');

    return gui;
}
