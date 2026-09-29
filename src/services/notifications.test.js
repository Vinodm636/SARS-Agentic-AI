import { buildEmergencyDispatchNotification } from './notifications';

describe('buildEmergencyDispatchNotification', () => {
  it('creates a clear alert payload for a successful ambulance dispatch', () => {
    const notification = buildEmergencyDispatchNotification({
      ambulanceId: 'AMB-102',
      eta: 6,
      driverName: 'Ravi Kumar',
      driverPhone: '+919876543210',
      sent: true,
    });

    expect(notification.title).toBe('Emergency dispatch alert: AMB-102');
    expect(notification.body).toContain('Ambulance AMB-102 assigned');
    expect(notification.body).toContain('ETA 6 min');
    expect(notification.body).toContain('Ravi Kumar');
  });
});
