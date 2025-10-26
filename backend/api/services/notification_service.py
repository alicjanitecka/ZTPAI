from api.repositories.notification_repository import NotificationRepository

class NotificationService:
    def __init__(self):
        self.repo = NotificationRepository()

    def create_notification(self, user, notification_type, title, message, visit=None):
        return self.repo.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            visit=visit
        )

    def list_notifications_for_user(self, user):
        return self.repo.list_for_user(user)

    def get_unread_count(self, user):
        return self.repo.get_unread_count(user)

    def mark_as_read(self, notification_id, user):
        return self.repo.mark_as_read(notification_id, user)

    def mark_all_as_read(self, user):
        self.repo.mark_all_as_read(user)

    def create_visit_notification(self, visit):
        """Create notifications for both user and petsitter when visit is created"""
        # Notification for petsitter
        self.create_notification(
            user=visit.petsitter.user,
            notification_type='visit_created',
            title='Nowa rezerwacja wizyty',
            message=f'{visit.user.username} umówił wizytę w dniach {visit.start_date} - {visit.end_date}.',
            visit=visit
        )

        # Notification for user (owner)
        self.create_notification(
            user=visit.user,
            notification_type='visit_created',
            title='Wizyta utworzona',
            message=f'Utworzono wizytę z {visit.petsitter.user.username} w dniach {visit.start_date} - {visit.end_date}.',
            visit=visit
        )
