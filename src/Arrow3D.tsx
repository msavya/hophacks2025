import React from 'react';

interface Arrow3DProps {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  scale?: number;
}

const Arrow3D: React.FC<Arrow3DProps> = ({ position, rotation, color, scale = 1 }) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Arrow shaft */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Arrow head */}
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.1, 0.3, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
};

export default Arrow3D;
