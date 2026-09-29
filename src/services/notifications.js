export const buildEmergencyDispatchNotification = ({ ambulanceId, eta, driverName, driverPhone, sent, error }) => {
  const etaText = typeof eta === 'number' ? `${eta} min` : eta || 'pending';
  const title = `Emergency dispatch alert: ${ambulanceId}`;
  const body = sent
    ? `Ambulance ${ambulanceId} assigned. ETA ${etaText}. Driver ${driverName || 'pending'} (${driverPhone || 'pending'}).`
    : `Ambulance ${ambulanceId} dispatch failed. ${error || 'Please try again.'}`;

  return { title, body };
};

export const notifyEmergencyDispatch = ({ ambulanceId, eta, driverName, driverPhone, sent, error }) => {
  const notification = buildEmergencyDispatchNotification({ ambulanceId, eta, driverName, driverPhone, sent, error });
  if (typeof window !== 'undefined' && 'alert' in window) {
    window.alert(`${notification.title}\n\n${notification.body}`);
  }
  return notification;
};
