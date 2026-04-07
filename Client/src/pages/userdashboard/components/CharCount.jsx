export default function CharCount({ value, max }) {
  const pct = (value.length / max) * 100;
  const color = pct > 90 ? "text-red-500" : pct > 70 ? "text-yellow-500" : "text-gray-400";
  return (
    <span className={`text-xs ml-auto ${color}`}>
      {value.length}/{max}
    </span>
  );
}
