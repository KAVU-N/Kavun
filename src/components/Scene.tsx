'use client';
import { Canvas } from '@react-three/fiber';
import Earth from './Earth';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';

interface Props {
  isLoggedIn: boolean;
}

export default function Scene({ isLoggedIn }: Props) {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/auth/');

  if (isAuthPage) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-50 pointer-events-none">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1e]/0 via-[#0a0a1e]/50 to-[#0a0a1e]" />
      
      <div className="w-full h-full bg-[#0a0a1e]">
        <Canvas
          className="pointer-events-auto"
          camera={{
            position: [0, 0, isLoggedIn ? 3 : 4],
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          style={{ height: '100vh' }}
        >
          <color attach="background" args={['#0a0a1e']} />
          <fog attach="fog" args={['#0a0a1e', 5, 15]} />
          
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[1, 1, 1]}
            intensity={1.5}
            castShadow
          />
          
          {/* Stars Background */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
          
          <Suspense fallback={null}>
            <Earth scale={isLoggedIn ? 1.5 : 2.5} />
          </Suspense>
          
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!isLoggedIn}
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 2.5}
            maxPolarAngle={Math.PI / 1.5}
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>
      </div>
    </div>
  );
} 