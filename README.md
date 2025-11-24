# Particle Generator

A high-performance, 60fps particle generator web application built with Three.js and Vite. Create stunning glowing particle scenes, customize them in real-time, and export as video or configuration.

## Features

- **Real-time Customization**: Adjust particle count, size, speed, radius, and color.
- **Glowing Particles**: Premium visual effects using UnrealBloomPass.
- **Video Export**: Record 5-second clips as `.webm` files.
- **Config Export**: Save and load particle configurations.
- **High Performance**: Optimized for 60fps even with high particle counts.

## Screenshots

| Default | High Count |
|---------|------------|
| ![Default](screenshots/1_default.png) | ![High Count](screenshots/2_high_count.png) |

| Low Count | Large Size |
|-----------|------------|
| ![Low Count](screenshots/3_low_count.png) | ![Large Size](screenshots/4_large_size.png) |

| Small Size | High Speed |
|------------|------------|
| ![Small Size](screenshots/5_small_size.png) | ![High Speed](screenshots/6_high_speed.png) |

| Large Radius | Red Color |
|--------------|-----------|
| ![Large Radius](screenshots/7_large_radius.png) | ![Red Color](screenshots/8_color_red.png) |

| Blue Color | Green Color |
|------------|-------------|
| ![Blue Color](screenshots/9_color_blue.png) | ![Green Color](screenshots/10_color_green.png) |

## Getting Started

### Prerequisites

- Node.js (v14 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/manikrathee/particle-generator.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:
```bash
npm run dev
```
Open your browser to `http://localhost:5173`.

## Usage

1. **Controls**: Use the UI overlay to change parameters.
2. **Export Video**: Click the button to download a `.webm` video.
3. **Export Config**: Save your settings as a JSON file.

## Technologies

- [Vite](https://vitejs.dev/)
- [Three.js](https://threejs.org/)
- [CCapture.js](https://github.com/spite/ccapture.js)
