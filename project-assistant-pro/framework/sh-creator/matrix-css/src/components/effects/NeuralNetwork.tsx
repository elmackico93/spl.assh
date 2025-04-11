import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';

export interface NeuralNetworkProps {
  className?: string;
  height?: string;
  width?: string;
  layers?: number[];
  animated?: boolean;
  showLabels?: boolean;
  theme?: 'matrix' | 'blue' | 'purple';
}

interface Node {
  x: number;
  y: number;
  active: boolean;
}

interface Connection {
  from: Node;
  to: Node;
  active: boolean;
}

export const NeuralNetwork: React.FC<NeuralNetworkProps> = ({
  className,
  height = '300px',
  width = '100%',
  layers = [4, 6, 5, 3],
  animated = true,
  showLabels = true,
  theme = 'matrix',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[][]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Get theme colors
  const getThemeColors = () => {
    switch (theme) {
      case 'blue':
        return {
          nodeColor: '#0066ff',
          activeNodeColor: '#00aaff',
          connectionColor: 'rgba(0, 102, 255, 0.3)',
          activeConnectionColor: '#0066ff',
          glow: 'rgba(0, 102, 255, 0.6)',
          textColor: '#0099ff'
        };
      case 'purple':
        return {
          nodeColor: '#aa00ff',
          activeNodeColor: '#cc00ff',
          connectionColor: 'rgba(170, 0, 255, 0.3)',
          activeConnectionColor: '#aa00ff',
          glow: 'rgba(170, 0, 255, 0.6)',
          textColor: '#cc33ff'
        };
      default: // matrix
        return {
          nodeColor: 'var(--m-text)',
          activeNodeColor: 'var(--m-text-bright)',
          connectionColor: 'var(--m-text-dim)',
          activeConnectionColor: 'var(--m-text)',
          glow: 'var(--m-glow)',
          textColor: 'var(--m-text)'
        };
    }
  };

  // Initialize network
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Generate nodes and connections when dimensions change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    
    const newNodes: Node[][] = [];
    const newConnections: Connection[] = [];
    
    // Generate nodes for each layer
    const layerGap = dimensions.width / (layers.length + 1);
    
    layers.forEach((nodeCount, layerIndex) => {
      const layerX = layerGap * (layerIndex + 1);
      const layerNodes: Node[] = [];
      
      // Calculate vertical spacing
      const nodeGap = dimensions.height / (nodeCount + 1);
      
      for (let i = 0; i < nodeCount; i++) {
        const nodeY = nodeGap * (i + 1);
        layerNodes.push({
          x: layerX,
          y: nodeY,
          active: false
        });
      }
      
      newNodes.push(layerNodes);
    });
    
    // Generate connections between layers
    for (let i = 0; i < newNodes.length - 1; i++) {
      const currentLayer = newNodes[i];
      const nextLayer = newNodes[i + 1];
      
      // Connect each node to all nodes in the next layer
      currentLayer.forEach(fromNode => {
        nextLayer.forEach(toNode => {
          newConnections.push({
            from: fromNode,
            to: toNode,
            active: false
          });
        });
      });
    }
    
    setNodes(newNodes);
    setConnections(newConnections);
  }, [dimensions, layers]);

  // Animation function
  useEffect(() => {
    if (!animated || nodes.length === 0) return;
    
    const activationInterval = setInterval(() => {
      // Randomly activate input nodes
      setNodes(prevNodes => {
        const newNodes = [...prevNodes];
        const inputLayer = [...newNodes[0]];
        
        // Reset all nodes
        newNodes.forEach(layer => {
          layer.forEach(node => {
            node.active = false;
          });
        });
        
        // Activate a random input node
        const randomNodeIndex = Math.floor(Math.random() * inputLayer.length);
        inputLayer[randomNodeIndex].active = true;
        newNodes[0] = inputLayer;
        
        return newNodes;
      });
      
      // Update connections based on active nodes
      setConnections(prevConnections => {
        return prevConnections.map(conn => ({
          ...conn,
          active: conn.from.active && Math.random() > 0.5
        }));
      });
      
      // After a delay, activate nodes in the next layer based on connections
      setTimeout(() => {
        setNodes(prevNodes => {
          const newNodes = [...prevNodes];
          
          // Activate nodes if they have an active incoming connection
          for (let i = 1; i < newNodes.length; i++) {
            newNodes[i] = newNodes[i].map(node => ({
              ...node,
              active: connections.some(conn => conn.to === node && conn.active)
            }));
          }
          
          return newNodes;
        });
      }, 150);
      
    }, 2000);
    
    return () => clearInterval(activationInterval);
  }, [animated, nodes, connections]);
  
  const themeColors = getThemeColors();

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-matrix-bg border border-matrix-border rounded overflow-hidden',
        className
      )}
      style={{ height, width }}
    >
      {/* Radial gradient background effect */}
      <div 
        className="absolute inset-0 bg-radial-gradient"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${themeColors.glow} 0%, transparent 70%)`
        }}
      />
      
      {/* Render connections */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((conn, i) => (
          <line
            key={`conn-${i}`}
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            stroke={conn.active ? themeColors.activeConnectionColor : themeColors.connectionColor}
            strokeWidth={conn.active ? 2 : 1}
            style={{
              transition: 'stroke 0.3s',
              boxShadow: conn.active ? `0 0 5px ${themeColors.glow}` : 'none'
            }}
          />
        ))}
      </svg>
      
      {/* Render layers */}
      {nodes.map((layer, layerIndex) => (
        <div
          key={`layer-${layerIndex}`}
          className="absolute h-full"
          style={{ left: `${(layerIndex + 1) * 100 / (layers.length + 1)}%`, transform: 'translateX(-50%)' }}
        >
          {/* Layer label */}
          {showLabels && (
            <div 
              className="absolute top-2 text-center w-full text-xs font-matrix-hacker" 
              style={{ color: themeColors.textColor }}
            >
              {layerIndex === 0 ? 'Input' : layerIndex === layers.length - 1 ? 'Output' : `Hidden ${layerIndex}`}
            </div>
          )}
          
          {/* Render nodes */}
          {layer.map((node, nodeIndex) => (
            <div
              key={`node-${layerIndex}-${nodeIndex}`}
              className={cn(
                'absolute w-5 h-5 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2',
                node.active && 'animate-[neuron-pulse_2s_infinite]'
              )}
              style={{
                left: 0,
                top: node.y,
                backgroundColor: node.active ? themeColors.activeNodeColor : 'transparent',
                borderColor: node.active ? themeColors.activeNodeColor : themeColors.nodeColor,
                boxShadow: node.active ? `0 0 10px ${themeColors.glow}` : 'none',
                transition: 'background-color 0.3s, border-color 0.3s, box-shadow 0.3s'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default NeuralNetwork;

