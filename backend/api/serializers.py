
from api.models import CustomUser, Petsitter, Visit, Pet, PetsitterAvailability
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
        model = CustomUser  #
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
    city = serializers.CharField(source='user.city', read_only=True)

    class Meta:
        model = Petsitter
        fields = [
            'id', 'username', 'city', 'description', 'hourly_rate',
            'is_dog_sitter', 'is_cat_sitter', 'is_rodent_sitter',
            'care_at_owner_home', 'care_at_petsitter_home', 'dog_walking'
        ]
        read_only_fields = ['user']

class VisitSerializer(serializers.ModelSerializer):
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