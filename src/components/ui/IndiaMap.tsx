import React, { useState } from 'react';
import { useAppData } from '../../state/AppDataContext';
import { DemandCluster, CategoryType } from '../../types';
import { MapPin, Layers, Filter, Eye, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface IndiaMapProps {
  selectedCategory?: string;
  selectedState?: string;
  onStateChange?: (state: string) => void;
  onSelectCluster?: (cluster: DemandCluster) => void;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({
  selectedCategory = 'all',
  selectedState = 'all',
  onStateChange,
  onSelectCluster
}) => {
  const [activeLayer, setActiveLayer] = useState<'heatmap' | 'clusters' | 'gaps'>('clusters');
  const [hoveredCluster, setHoveredCluster] = useState<DemandCluster | null>(null);
  const { hotspots } = useAppData();

  // Scaled coordinates for SVG rendering on custom India Map path layout
  const mapHotspots = hotspots.filter(h => {
    if (selectedCategory !== 'all' && h.category !== selectedCategory) return false;
    if (selectedState !== 'all' && h.state !== selectedState) return false;
    return true;
  });

  // State coordinate mapping for India Map SVG
  const stateRegions = [
    { name: 'Uttar Pradesh', code: 'UP', path: 'M 350 160 L 450 150 L 520 200 L 440 240 L 360 210 Z', color: '#1e293b' },
    { name: 'Bihar', code: 'BR', path: 'M 520 200 L 600 200 L 620 250 L 540 250 Z', color: '#1e293b' },
    { name: 'Rajasthan', code: 'RJ', path: 'M 200 160 L 350 160 L 360 210 L 250 280 L 180 230 Z', color: '#1e293b' },
    { name: 'Madhya Pradesh', code: 'MP', path: 'M 320 220 L 460 220 L 460 290 L 310 280 Z', color: '#1e293b' },
    { name: 'Maharashtra', code: 'MH', path: 'M 240 280 L 380 280 L 390 380 L 260 360 Z', color: '#1e293b' },
    { name: 'Gujarat', code: 'GJ', path: 'M 140 230 L 230 250 L 220 310 L 130 290 Z', color: '#1e293b' },
    { name: 'Karnataka', code: 'KA', path: 'M 260 370 L 340 370 L 330 460 L 280 440 Z', color: '#1e293b' },
    { name: 'Tamil Nadu', code: 'TN', path: 'M 320 450 L 370 440 L 360 520 L 310 500 Z', color: '#1e293b' },
    { name: 'West Bengal', code: 'WB', path: 'M 600 240 L 640 230 L 630 320 L 590 290 Z', color: '#1e293b' }
  ];

  // Specific pixel mappings for SVG markers
  const clusterCoords: Record<string, { x: number; y: number }> = {
    'CLUST-UP-01': { x: 410, y: 190 }, // Lucknow, UP
    'CLUST-BR-02': { x: 560, y: 220 }, // Gaya, Bihar
    'CLUST-MH-03': { x: 300, y: 320 }, // Nashik, MH
    'CLUST-RJ-04': { x: 260, y: 200 }, // Jodhpur, RJ
    'CLUST-MP-05': { x: 400, y: 250 }, // Jabalpur, MP
  };

  const getCategoryColor = (cat: CategoryType) => {
    switch (cat) {
      case 'road': return '#e2982b';
      case 'water': return '#5b9bd5';
      case 'health': return '#e05252';
      case 'electricity': return '#f59e0b';
      case 'education': return '#818cf8';
      default: return '#4faf9a';
    }
  };

  return (
    <div className="bg-[#11161d] border border-[#242c36] rounded p-4 relative overflow-hidden flex flex-col h-[520px] select-none shadow-xs">
      {/* Map Header Controls */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#242c36] gap-2 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#e6edf3]">
              National Infrastructure Intelligence Map
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-900/30 text-sky-400 border border-sky-500/30">
              GIS ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-[#6e7681] font-mono mt-0.5">
            Geospatial Demand Hotspots & National Infrastructure Deficits
          </p>
        </div>

        {/* Layer Toggles & State Filter */}
        <div className="flex items-center gap-2">
          {/* Layer Selector */}
          <div className="flex items-center bg-[#0b0e12] border border-[#242c36] rounded p-0.5">
            <button
              onClick={() => setActiveLayer('clusters')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                activeLayer === 'clusters' ? 'bg-[#181f28] text-[#5b9bd5] font-semibold' : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              Hotspots
            </button>
            <button
              onClick={() => setActiveLayer('heatmap')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                activeLayer === 'heatmap' ? 'bg-[#181f28] text-amber-400 font-semibold' : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              Heatmap
            </button>
            <button
              onClick={() => setActiveLayer('gaps')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                activeLayer === 'gaps' ? 'bg-[#181f28] text-rose-400 font-semibold' : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              Infra Gaps
            </button>
          </div>

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => onStateChange?.(e.target.value)}
            className="bg-[#0b0e12] border border-[#242c36] text-[#e6edf3] text-[11px] font-mono rounded px-2 py-1 outline-none"
          >
            <option value="all">All States (India)</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Bihar">Bihar</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
          </select>
        </div>
      </div>

      {/* Main Vector SVG GIS Canvas */}
      <div className="flex-1 relative mt-2 bg-[#0b0e12] rounded border border-[#1b222c] overflow-hidden flex items-center justify-center">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />

        {/* Legend Overlay */}
        <div className="absolute top-3 left-3 bg-[#11161d]/90 border border-[#242c36] p-2.5 rounded text-[10px] font-mono space-y-1.5 z-20 backdrop-blur-sm">
          <div className="text-[#8b949e] font-semibold border-b border-[#242c36] pb-1">CATEGORY LEGEND</div>
          <div className="flex items-center gap-2 text-[#e6edf3]">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Road & Bridges</span>
          </div>
          <div className="flex items-center gap-2 text-[#e6edf3]">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>Water Supply</span>
          </div>
          <div className="flex items-center gap-2 text-[#e6edf3]">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span>Health PHCs</span>
          </div>
          <div className="flex items-center gap-2 text-[#e6edf3]">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span>Electricity Grid</span>
          </div>
          <div className="flex items-center gap-2 text-[#e6edf3]">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span>School Education</span>
          </div>
        </div>

        {/* SVG Map Container */}
        <svg viewBox="0 0 800 580" className="w-full h-full max-h-[460px]">
          {/* State Boundary Paths */}
          <g>
            {stateRegions.map((st) => (
              <path
                key={st.code}
                d={st.path}
                fill="#151b23"
                stroke="#242c36"
                strokeWidth="1.5"
                className="hover:fill-[#181f28] transition-colors cursor-pointer"
                onClick={() => onStateChange?.(selectedState === st.name ? 'all' : st.name)}
              >
                <title>{st.name}</title>
              </path>
            ))}
          </g>

          {/* Heatmap Glow Circles (If Heatmap layer active) */}
          {activeLayer === 'heatmap' && mapHotspots.map((cluster) => {
            const pos = clusterCoords[cluster.id] || { x: 400, y: 250 };
            return (
              <circle
                key={`heat-${cluster.id}`}
                cx={pos.x}
                cy={pos.y}
                r={cluster.priorityScore * 0.7}
                fill={getCategoryColor(cluster.category)}
                opacity="0.2"
                className="animate-pulse"
              />
            );
          })}

          {/* Interactive Cluster Pin Markers */}
          {mapHotspots.map((cluster) => {
            const pos = clusterCoords[cluster.id] || { x: 400, y: 250 };
            const catColor = getCategoryColor(cluster.category);
            const isHovered = hoveredCluster?.id === cluster.id;

            return (
              <g
                key={cluster.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredCluster(cluster)}
                onMouseLeave={() => setHoveredCluster(null)}
                onClick={() => onSelectCluster && onSelectCluster(cluster)}
              >
                {/* Pulse Ring */}
                <circle
                  r={isHovered ? 24 : 16}
                  fill={catColor}
                  opacity={isHovered ? 0.4 : 0.25}
                  className="animate-ping"
                />

                {/* Outer Ring */}
                <circle
                  r={isHovered ? 14 : 10}
                  fill="#0b0e12"
                  stroke={catColor}
                  strokeWidth="2.5"
                />

                {/* Center Score Dot */}
                <circle
                  r={4}
                  fill={catColor}
                />

                {/* Marker Label */}
                <text
                  x={16}
                  y={4}
                  fill="#e6edf3"
                  fontSize="11"
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                  className="pointer-events-none drop-shadow-md"
                >
                  {cluster.district} ({cluster.priorityScore})
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered District Detail Tooltip */}
        {hoveredCluster && (
          <div className="absolute bottom-4 right-4 bg-[#11161d] border border-[#5b9bd5]/50 p-3 rounded shadow-xl w-72 z-30 font-mono text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#242c36] pb-1.5 mb-2">
              <span className="font-bold text-[#e6edf3]">{hoveredCluster.title}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30">
                SCORE: {hoveredCluster.priorityScore}
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-[#8b949e]">
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="text-[#e6edf3]">{hoveredCluster.district}, {hoveredCluster.state}</span>
              </div>
              <div className="flex justify-between">
                <span>Citizen Requests:</span>
                <span className="text-amber-400 font-bold">{hoveredCluster.complaintCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Pop. Affected:</span>
                <span className="text-[#e6edf3]">{hoveredCluster.totalAffectedPopulation.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Infra Gap Level:</span>
                <span className="text-rose-400 font-semibold">{hoveredCluster.infraGapLevel}</span>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#242c36] text-[10px] text-sky-400 flex items-center justify-between">
              <span>Click to view AI recommendation</span>
              <span>→</span>
            </div>
          </div>
        )}
      </div>

      {/* Map Footer Summary Metrics */}
      <div className="mt-3 pt-2 border-t border-[#242c36] flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
        <div className="flex items-center gap-4">
          <span>Active GIS Layer: <strong className="text-[#e6edf3] uppercase">{activeLayer}</strong></span>
          <span>Mapped Clusters: <strong className="text-[#5b9bd5]">{mapHotspots.length} Regions</strong></span>
        </div>
        <div>
          <span>Coordinates: <strong className="text-[#6e7681]">20.5937° N, 78.9629° E</strong></span>
        </div>
      </div>
    </div>
  );
};
