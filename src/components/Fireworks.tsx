import React, { useEffect, useState } from 'react';

type Particle = {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
}

export const Fireworks = () => {
  const [fireworks, setFireworks] = useState<{ id: number; particles: Particle[] }[]>([]);
  const [count, setCount] = useState(0);
  
  const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#f72585', '#4cc9f0'];
  
  const createFirework = (x: number, y: number) => {
    const id = Date.now() + Math.random();
    const particleCount = 30 + Math.floor(Math.random() * 20);
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 5;
      const size = 3 + Math.random() * 7;
      const life = 30 + Math.random() * 30;
      
      particles.push({
        id: i,
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
        size,
        life,
        maxLife: life,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
      });
    }
    
    setFireworks(prev => [...prev, { id, particles }]);
    
    // Remove this firework after all particles are gone
    setTimeout(() => {
      setFireworks(prev => prev.filter(fw => fw.id !== id));
    }, 3000);
  };
  
  const launchRandomFirework = () => {
    const x = 100 + Math.random() * 300;
    const y = 50 + Math.random() * 200;
    createFirework(x, y);
  };
  
  // Launch initial fireworks
  useEffect(() => {
    const timer = setInterval(() => {
      if (count < 10) {
        launchRandomFirework();
        setCount(prev => prev + 1);
      } else {
        clearInterval(timer);
      }
    }, 300);
    
    return () => clearInterval(timer);
  }, [count]);
  
  // Update particles
  useEffect(() => {
    const gravity = 0.1;
    const friction = 0.98;
    
    const updateParticles = () => {
      setFireworks(prevFireworks => 
        prevFireworks.map(firework => ({
          ...firework,
          particles: firework.particles.map(particle => {
            // Apply gravity and friction
            const vy = particle.vy + gravity;
            const vx = particle.vx * friction;
            
            // Update position and life
            return {
              ...particle,
              x: particle.x + vx,
              y: particle.y + vy,
              vx,
              vy,
              life: particle.life - 1
            };
          }).filter(particle => particle.life > 0)
        }))
      );
    };
    
    const interval = setInterval(updateParticles, 30);
    return () => clearInterval(interval);
  }, []);
  
  // Add click handler for more fireworks
  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    createFirework(x, y);
  };
  
  return (
    <div 
      className="absolute inset-0 z-10 overflow-hidden pointer-events-auto cursor-crosshair" 
      onClick={handleClick}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
      >
        {fireworks.map(firework => (
          firework.particles.map(particle => {
            const opacity = particle.life / particle.maxLife;
            
            return (
              <circle
                key={`${firework.id}-${particle.id}`}
                cx={particle.x}
                cy={particle.y}
                r={particle.size * opacity}
                fill={particle.color}
                opacity={opacity}
              />
            );
          })
        ))}
      </svg>
    </div>
  );
}; 