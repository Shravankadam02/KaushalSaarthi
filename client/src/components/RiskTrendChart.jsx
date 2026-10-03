import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

export default function RiskTrendChart({ riskHistory }) {
  if (!riskHistory || riskHistory.length < 2) {
    return (
      <p className="text-sm text-slate-400 py-8 text-center">
        Not enough history yet — trend appears after multiple profile views over time.
      </p>
    );
  }

  const labels = riskHistory.map((h) =>
    new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  );
  const scores = riskHistory.map((h) => Math.round(h.riskScore * 100));

  const data = {
    labels,
    datasets: [
      {
        data: scores,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => `Risk: ${ctx.parsed.y}%` },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (v) => `${v}%`, font: { size: 11 } },
        grid: { color: '#F1F5F9' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  return <Line data={data} options={options} />;
}