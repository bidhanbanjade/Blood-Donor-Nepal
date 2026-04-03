import './DashboardState.css';

const DashboardState = ({ type = 'loading', message }) => {
  return (
    <div className={`dashboard-state ${type}`}>
      <p>{message}</p>
    </div>
  );
};

export default DashboardState;
