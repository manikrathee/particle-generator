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
      size: 0.2, // Smaller, more elegant particles
      color: '#4fc3f7', // Cyan/Blue glow
      speed: 0.5, // Slower, smoother motion
      radius: 15,
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
        uSpeed: { value: this.params.speed },
        uMouse: { value: new THREE.Vector3(9999, 9999, 9999) }, // Default far away
        uRippleCenter: { value: new THREE.Vector3(0, 0, 0) },
        uRippleTime: { value: 10.0 }, // High value = finished
        uRippleStrength: { value: 0.0 }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        uniform float uSpeed;
        uniform vec3 uMouse;
        uniform vec3 uRippleCenter;
        uniform float uRippleTime;
        uniform float uRippleStrength;
        
        attribute float aScale;
        attribute vec3 aRandomness;
        
        varying vec3 vColor;

        // Simplex 3D Noise 
        // by Ian McEwan, Ashima Arts
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){ 
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

          // First corner
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;

          // Other corners
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );

          //  x0 = x0 - 0.0 + 0.0 * C 
          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

          // Permutations
          i = mod(i, 289.0 ); 
          vec4 p = permute( permute( permute( 
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

          // Gradients
          float n_ = 1.0/7.0; // N=7
          vec3  ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,N*N)

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);

          //Normalise gradients
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          // Mix final noise value
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                        dot(p2,x2), dot(p3,x3) ) );
        }
        
        void main() {
          vec3 newPos = position;
          
          // 1. Liquid Flow (FBM - Fractal Brownian Motion)
          float time = uTime * uSpeed * 0.1;
          
          // Layer 1 (Base flow)
          float n1 = snoise(vec3(newPos.xy * 0.08, time));
          // Layer 2 (Detail)
          float n2 = snoise(vec3(newPos.xy * 0.2, time * 2.0));
          
          float noiseVal = n1 + n2 * 0.5;
          
          newPos.x += noiseVal * 0.8;
          newPos.y += snoise(vec3(newPos.yx * 0.08, time)) * 0.8;
          newPos.z += snoise(vec3(newPos.xy * 0.1, time + 10.0)) * 0.5;
          
          // 2. Mouse Gravity (Viscous & Magnetic)
          float mouseDist = distance(newPos, uMouse);
          // Larger influence radius, smoother falloff
          float influence = 1.0 - smoothstep(0.0, 40.0, mouseDist); 
          influence = pow(influence, 2.5); // Slightly softer easing
          
          vec3 pullDir = normalize(uMouse - newPos);
          // Gentle pull, not too aggressive
          newPos += pullDir * influence * 5.0; 

          // 3. Ripple Effect (Refined Wavefront)
          float rippleDist = distance(newPos, uRippleCenter);
          
          float waveSpeed = 15.0; // Slower, heavier liquid
          float waveFreq = 1.0;   // Lower frequency for wider waves
          float currentRadius = uRippleTime * waveSpeed;
          
          float distFromWave = abs(rippleDist - currentRadius);
          float waveWidth = 15.0; // Thicker wave packet
          
          float ripple = 0.0;
          
          if (distFromWave < waveWidth) {
             float angle = rippleDist * waveFreq - uRippleTime * (waveSpeed * waveFreq);
             float s = sin(angle);
             
             // Smoother windowing
             float window = 1.0 - smoothstep(0.0, waveWidth, distFromWave);
             window = smoothstep(0.0, 1.0, window); // Ease in-out window
             
             // Slower attenuation for longer lasting ripples
             float attenuation = 1.0 / (1.0 + rippleDist * 0.02);
             attenuation *= exp(-uRippleTime * 0.8);
             
             ripple = s * window * attenuation * uRippleStrength * 10.0;
          }
          
          newPos.z += ripple;
          
          vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Size attenuation
          gl_PointSize = uSize * aScale * (150.0 / -mvPosition.z);
          
          // Color Logic
          vColor = color;
          
          // Depth darkening (fake occlusion)
          float depth = smoothstep(-20.0, 20.0, newPos.z);
          vColor *= (0.5 + 0.5 * depth);
          
          // Highlight peaks
          vColor += vec3(max(0.0, ripple * 0.15));
          vColor += vec3(influence * 0.2); // Slight glow near mouse
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
      // Increment ripple time
      this.material.uniforms.uRippleTime.value += deltaTime;
    }
  }

  setMousePosition(x, y, z) {
    if (this.material) {
      this.material.uniforms.uMouse.value.set(x, y, z);
    }
  }

  triggerRipple(x, y, z, strength) {
    if (this.material) {
      this.material.uniforms.uRippleCenter.value.set(x, y, z);
      this.material.uniforms.uRippleTime.value = 0.0;
      this.material.uniforms.uRippleStrength.value = strength;
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
