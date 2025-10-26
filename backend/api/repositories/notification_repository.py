from api.models import Notification

class NotificationRepository:
    def create(self, user, **kwargs):
        return Notification.objects.create(user=user, **kwargs)

    def list_for_user(self, user):
        return Notification.objects.filter(user=user).order_by('-created_at')

    def get_unread_count(self, user):
        return Notification.objects.filter(user=user, is_read=False).count()

    def mark_as_read(self, notification_id, user):
        notification = Notification.objects.filter(id=notification_id, user=user).first()
        if notification:
            notification.is_read = True
            notification.save()
        return notification

    def mark_all_as_read(self, user):
        Notification.objects.filter(user=user, is_read=False).update(is_read=True)
