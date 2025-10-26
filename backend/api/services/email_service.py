from django.core.mail import send_mail
from django.conf import settings

class EmailService:
    @staticmethod
    def send_visit_created_email(visit):
        """Send email notifications to both user and petsitter when a visit is created"""

        # Email to petsitter
        petsitter_subject = 'Nowa rezerwacja wizyty - PetZone'
        petsitter_message = f"""
Witaj {visit.petsitter.user.first_name or visit.petsitter.user.username}!

Masz nową rezerwację wizyty:

Właściciel: {visit.user.username}
Typ opieki: {visit.care_type}
Data rozpoczęcia: {visit.start_date}
Data zakończenia: {visit.end_date}

Zaloguj się do PetZone, aby zobaczyć szczegóły.

Pozdrawiamy,
Zespół PetZone
        """

        try:
            send_mail(
                subject=petsitter_subject,
                message=petsitter_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[visit.petsitter.user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email to petsitter: {e}")

        # Email to user (pet owner)
        owner_subject = 'Potwierdzenie rezerwacji - PetZone'
        owner_message = f"""
Witaj {visit.user.first_name or visit.user.username}!

Twoja rezerwacja została utworzona:

Petsitter: {visit.petsitter.user.username}
Typ opieki: {visit.care_type}
Data rozpoczęcia: {visit.start_date}
Data zakończenia: {visit.end_date}

Zaloguj się do PetZone, aby zobaczyć szczegóły.

Pozdrawiamy,
Zespół PetZone
        """

        try:
            send_mail(
                subject=owner_subject,
                message=owner_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[visit.user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email to user: {e}")
