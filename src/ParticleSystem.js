import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene, count = 5000) {
    this.scene = scene;
    this.count = count;
    this.geometry = new THREE.BufferGeometry();
    this.material = null;
    this.points = null;
    
    this.params = {
      count: count,
      size: 0.5,
      color: '#00ffff',
      speed: 1.0,
      radius: 10,
      randomness: 0.5
    };

    this.init();
  }

  init() {
    if (this.points) {
      this.scene.remove(this.points);
      this.geometry.dispose();
      this.material.dispose();
    }

    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.params.count * 3);
    const colors = new Float32Array(this.params.count * 3);
    const scales = new Float32Array(this.params.count);
    const randomness = new Float32Array(this.params.count * 3);

    const color = new THREE.Color(this.params.color);

    for (let i = 0; i < this.params.count; i++) {
      const i3 = i * 3;
      
      // Spherical distribution
      const r = this.params.radius * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      scales[i] = Math.random();
      
      randomness[i3] = (Math.random() - 0.5) * 2;
      randomness[i3 + 1] = (Math.random() - 0.5) * 2;
      randomness[i3 + 2] = (Math.random() - 0.5) * 2;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    this.geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3));

    // Custom shader for more control
    this.material = new THREE.ShaderMaterial({
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: this.params.size * window.devicePixelRatio },
        uSpeed: { value: this.params.speed }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        uniform float uSpeed;
        
        attribute float aScale;
        attribute vec3 aRandomness;
        
        varying vec3 vColor;
        
        void main() {
          vec3 newPos = position;
          
          // Simple noise/motion
          newPos += aRandomness * sin(uTime * uSpeed + newPos.x * 0.5) * 0.5;
          
          vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          gl_PointSize = uSize * aScale * (100.0 / -mvPosition.z);
          vColor = color;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          // Circular particle
          float strength = distance(gl_PointCoord, vec2(0.5));
          strength = 1.0 - strength;
          strength = pow(strength, 3.0);
          
          vec3 finalColor = mix(vec3(0.0), vColor, strength);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  update(deltaTime, elapsedTime) {
    if (this.material) {
      this.material.uniforms.uTime.value = elapsedTime;
    }
  }

  regenerate(newParams) {
    this.params = { ...this.params, ...newParams };
    this.init();
  }
  
  updateParams(key, value) {
    this.params[key] = value;
    if (key === 'size' && this.material) {
        this.material.uniforms.uSize.value = value * window.devicePixelRatio;
    }
    if (key === 'speed' && this.material) {
        this.material.uniforms.uSpeed.value = value;
    }
    // For other params that require geometry rebuild
    if (['count', 'radius', 'color'].includes(key)) {
        this.init();
    }
  }
}
