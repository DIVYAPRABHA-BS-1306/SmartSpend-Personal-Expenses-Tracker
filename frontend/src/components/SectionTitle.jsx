const SectionTitle = ({ title, subtitle }) => (
  <div className="section-title">
    <h2>{title}</h2>
    {subtitle && <p>{subtitle}</p>}
  </div>
);

export default SectionTitle;
