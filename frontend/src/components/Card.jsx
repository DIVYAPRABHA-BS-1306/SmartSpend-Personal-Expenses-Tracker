const Card = ({ title, value, children, className = '' }) => (
  <div className={`card ${className}`.trim()}>
    <h3>{title}</h3>
    {value && <p>{value}</p>}
    {children}
  </div>
);

export default Card;
