
from api.models import CustomUser, Petsitter, Visit, Pet, PetsitterAvailability, Review, Chat, Message, Notification
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserListDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email','role'] 

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': True},
            'email': {'required': True},
        }

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value
    
    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    
class UserProfileSerializer(serializers.ModelSerializer):
    is_petsitter = serializers.SerializerMethodField()
    def get_is_petsitter(self, obj):
        return Petsitter.objects.filter(user=obj).exists()
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'phone',
            'city',
            'street',
            'house_number',
            'apartment_number',
            'postal_code',
            'photo',
            'is_petsitter'
        ]
        read_only_fields = ['id', 'email']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token
    
class PetsitterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    city = serializers.CharField(source='user.city', read_only=True)
    photo = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    def get_photo(self, obj):
        if obj.user.photo:
            return obj.user.photo.url
        return None

    def get_average_rating(self, obj):
        from api.repositories.review_repository import ReviewRepository
        avg = ReviewRepository().get_average_rating(obj)
        return round(avg, 1) if avg else 0

    def get_reviews_count(self, obj):
        from api.repositories.review_repository import ReviewRepository
        return ReviewRepository().get_reviews_count(obj)

    class Meta:
        model = Petsitter
        fields = [
            'id', 'user_id', 'username', 'city', 'photo', 'description', 'hourly_rate',
            'is_dog_sitter', 'is_cat_sitter', 'is_rodent_sitter',
            'care_at_owner_home', 'care_at_petsitter_home', 'dog_walking',
            'average_rating', 'reviews_count'
        ]
        read_only_fields = ['user']

class VisitSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    petsitter_username = serializers.CharField(source='petsitter.user.username', read_only=True)
    petsitter_id = serializers.IntegerField(source='petsitter.id', read_only=True)
    review = serializers.SerializerMethodField(read_only=True)

    def get_review(self, obj):
        try:
            review = obj.review
            return {
                'id': review.id,
                'rating': review.rating,
                'comment': review.comment,
                'created_at': review.created_at,
                'updated_at': review.updated_at
            }
        except:
            return None

    class Meta:
        model = Visit
        fields = '__all__'
        read_only_fields = ['user']

class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = '__all__'
        read_only_fields = ['user']

class PetsitterAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = PetsitterAvailability
        fields = ['id', 'date', 'is_available']
        read_only_fields = ['id']

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_username = serializers.CharField(source='reviewer.username', read_only=True)
    reviewer_photo = serializers.SerializerMethodField(read_only=True)
    petsitter_username = serializers.CharField(source='petsitter.user.username', read_only=True)

    def get_reviewer_photo(self, obj):
        if obj.reviewer.photo:
            return obj.reviewer.photo.url
        return None

    class Meta:
        model = Review
        fields = ['id', 'visit', 'petsitter', 'reviewer', 'reviewer_username', 'reviewer_photo',
                  'petsitter_username', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'reviewer', 'created_at', 'updated_at']


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_photo = serializers.SerializerMethodField(read_only=True)

    def get_sender_photo(self, obj):
        if obj.sender.photo:
            return obj.sender.photo.url
        return None

    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'sender_username', 'sender_photo',
                  'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']


class ChatSerializer(serializers.ModelSerializer):
    participant1_username = serializers.CharField(source='participant1.username', read_only=True)
    participant2_username = serializers.CharField(source='participant2.username', read_only=True)
    participant1_photo = serializers.SerializerMethodField(read_only=True)
    participant2_photo = serializers.SerializerMethodField(read_only=True)
    last_message = serializers.SerializerMethodField(read_only=True)
    unread_count = serializers.SerializerMethodField(read_only=True)

    def get_participant1_photo(self, obj):
        if obj.participant1.photo:
            return obj.participant1.photo.url
        return None

    def get_participant2_photo(self, obj):
        if obj.participant2.photo:
            return obj.participant2.photo.url
        return None

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

    class Meta:
        model = Chat
        fields = ['id', 'participant1', 'participant2', 'participant1_username',
                  'participant2_username', 'participant1_photo', 'participant2_photo',
                  'last_message', 'unread_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'title', 'message', 'visit', 'is_read', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']