import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { AsciiRenderer, Center } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';

const BrainFBXModel = () => {
  // Load the FBX model provided by the user
  const fbx = useLoader(FBXLoader, '/Mozgani/brain.fbx');
  const groupRef = useRef();

  // Create a material that catches light perfectly for the ASCII renderer
  // Using white color so it perfectly reflects the 2 colored lights
  const material = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#ffffff',
    roughness: 0.2,
    metalness: 0.8,
  }), []);

  // Traverse the FBX scene and apply the material to all meshes
  useEffect(() => {
    if (fbx) {
      fbx.traverse((child) => {
        if (child.isMesh) {
          child.material = material;
          // Compute normals if they are missing
          if (!child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals();
          }
        }
      });
    }
  }, [fbx, material]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Increased scale to 0.006 based on feedback. Position manually offset to -1.2 to center the FBX mesh vertically in the camera view */}
      <primitive object={fbx} scale={0.006} position={[0, -1.2, 0]} />
    </group>
  );
};

const AsciiGlobe = () => {
  return (
    <div className="w-full h-full relative flex items-center justify-center bg-transparent overflow-hidden rounded-2xl pointer-events-none" style={{ transform: 'translateZ(0)' }}>
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }} 
        dpr={1} // Force DPR to 1 to drastically reduce WebGL and ASCII computation overhead
      >
        {/* Ambient light for base illumination */}
        <ambientLight intensity={0.2} />
        {/* Two distinct colored directional lights to create a 2-color effect on the 3D model */}
        <directionalLight position={[10, 10, 10]} intensity={3.0} color="#4f46e5" />
        <directionalLight position={[-10, 10, -10]} intensity={2.0} color="#e546b3" />
        <directionalLight position={[0, -10, 0]} intensity={0.5} color="#0055ff" />
        
        {/* Manually centering the loaded FBX instead of using Center wrapper, which struggles with FBX bounding boxes */}
        <React.Suspense fallback={null}>
          <BrainFBXModel />
        </React.Suspense>
        
        {/* 
          AsciiRenderer automatically replaces the canvas output with ASCII characters.
          Enabled color={true} to inherit the 2-color lighting effect.
          Lowered resolution to 0.25 to vastly reduce DOM elements and fix scroll lag.
        */}
        <AsciiRenderer 
          color={true}
          fgColor="#4f46e5" 
          bgColor="transparent" 
          characters=" .:-+*=%@#"
          invert={false}
          resolution={0.25}
        />
      </Canvas>
    </div>
  );
};

export default AsciiGlobe;
