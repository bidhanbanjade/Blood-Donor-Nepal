import './Statistics.css';

const Statistics = () => {
  return (
    <section className="statistics">
      <div className="statistics-container">
        <div className="stat-item">
          <div className="stat-number">500+</div>
          <div className="stat-label">Active Donors</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">1,200+</div>
          <div className="stat-label">Lives Saved</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">50+</div>
          <div className="stat-label">Cities Covered</div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;

