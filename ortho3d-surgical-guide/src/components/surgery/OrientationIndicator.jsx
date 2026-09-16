import { useAppStore } from '../../store/useAppStore';
import './OrientationIndicator.css';

const AXES = ['A', 'P', 'M', 'L', 'S', 'I'];

export default function OrientationIndicator() {
  const orientation = useAppStore((s) => s.orientation);
  return (
    <div className="orientation-indicator" aria-label="Anatomical orientation">
      {AXES.map((axis) => (
        <span key={axis} className={`ori-cell ${orientation[axis] ? 'on' : ''}`}>
          {axis}
        </span>
      ))}
    </div>
  );
}
