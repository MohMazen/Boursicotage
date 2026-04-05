import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function MarketChart({ actions }) {
    const [history, setHistory] = useState([]);
    
    useEffect(() => {
        if (!actions || actions.length === 0) return;
        
        const now = new Date().toLocaleTimeString('fr-FR', { minute: '2-digit', second: '2-digit' });
        
        setHistory(prev => {
            const newHistory = [...prev, { time: now, data: actions }];
            if (newHistory.length > 20) newHistory.shift();
            return newHistory;
        });
    }, [actions]);

    if (history.length === 0) {
        return <div className="text-muted text-center py-4">En attente de données marché...</div>;
    }

    const labels = history.map(h => h.time);
    const datasets = actions.map((action, i) => ({
        label: action.nom,
        data: history.map(h => {
            const ac = h.data.find(a => a.id === action.id);
            return ac ? ac.prix : null;
        }),
        borderColor: COLORS[i % COLORS.length],
        backgroundColor: COLORS[i % COLORS.length],
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2
    }));

    const data = { labels, datasets };
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#e2e8f0', usePointStyle: true, boxWidth: 8 } },
        },
        scales: {
            y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            x: { ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 45 }, grid: { color: 'rgba(255,255,255,0.02)' } }
        },
        animation: { duration: 300 }
    };

    return (
        <div style={{ height: '280px', width: '100%', padding: '0 10px' }}>
            <Line options={options} data={data} />
        </div>
    );
}
