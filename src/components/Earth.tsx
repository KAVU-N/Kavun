'use client';
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';
import { gsap } from 'gsap';

interface Props {
  scale?: number;
}

export default function Earth({ scale = 1 }: Props) {
  const meshRef = useRef<Mesh>(null);
  const targetPosition = useRef(new Vector3(0, 0, 0));
  const initialScale = useRef(scale * 0.1);

  // Giriş animasyonu
  useEffect(() => {
    if (meshRef.current) {
      gsap.to(initialScale, {
        current: scale,
        duration: 2,
        ease: 'power3.out',
      });

      gsap.to(meshRef.current.rotation, {
        y: Math.PI * 2,
        duration: 2,
        ease: 'power3.out',
      });
    }
  }, [scale]);

  // Mouse takibi
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      targetPosition.current.set(x * 0.3, y * 0.3, 0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Dünyayı döndür ve mouse'u takip et
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      
      // Yumuşak pozisyon geçişi
      meshRef.current.position.lerp(targetPosition.current, 0.1);
      
      // Scale animasyonu
      meshRef.current.scale.setScalar(initialScale.current);
    }
  });

  return (
    <group>
      {/* Atmosfer efekti */}
      <Sphere args={[2.1, 64, 64]} scale={[scale, scale, scale]}>
        <meshPhongMaterial
          transparent
          opacity={0.2}
          color="#4870df"
          blending={2}
          side={1}
        />
      </Sphere>

      {/* Dünya */}
      <mesh ref={meshRef} scale={[scale, scale, scale]}>
        <Sphere args={[2, 64, 64]}>
          <meshPhongMaterial
            color="#1e3a8a"
            emissive="#0f172a"
            specular="#ffffff"
            shininess={60}
            opacity={0.9}
            transparent
          />
        </Sphere>

        {/* Işıltı efekti */}
        <Sphere args={[2.02, 32, 32]}>
          <meshPhongMaterial
            color="#60a5fa"
            transparent
            opacity={0.1}
            blending={2}
          />
        </Sphere>
      </mesh>

      {/* Parçacık efekti */}
      <points>
        <sphereGeometry args={[2.5, 64, 64]} />
        <pointsMaterial
          size={0.01}
          color="#60a5fa"
          transparent
          opacity={0.5}
          sizeAttenuation
        />
      </points>
    </group>
  );
} 