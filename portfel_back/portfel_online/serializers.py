from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import AssetTypes, Assets, Portfolios, PortfolioAssets, Deals, DealSource

User = get_user_model()

class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class AssetTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetTypes
        fields = '__all__'

class DealSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealSource
        fields = '__all__'

class AssetsSerializer(serializers.ModelSerializer):
    asset_type_name = serializers.CharField(source='asset_type.name', read_only=True)
    asset_type_id = serializers.PrimaryKeyRelatedField(
         queryset=AssetTypes.objects.all(), source='asset_type', write_only=True, required=False
    )
    current_price = serializers.DecimalField(max_digits=12, decimal_places=4, read_only=True, required=False)

    class Meta:
        model = Assets
        fields = [
            'Asset_ID', 'ISIN', 'ticker', 'company', 'country', 'region',
            'exchange', 'market', 'trading_type', 'management_fee', 'currency',
            'description', 'dividend_yield', 'pe_ratio', 'pb_ratio', 'beta',
            'asset_type_name',
            'asset_type_id',
            'current_price',
        ]
        read_only_fields = [
             'dividend_yield', 'pe_ratio', 'pb_ratio', 'beta', 'Asset_ID', 'asset_type_name',
             'current_price'
        ]


class PortfolioAssetsSerializer(serializers.ModelSerializer):
    asset = AssetsSerializer(read_only=True)
    asset_id = serializers.PrimaryKeyRelatedField(
        queryset=Assets.objects.all(), source='asset', write_only=True
    )
    portfolio = serializers.PrimaryKeyRelatedField(read_only=True)
    quantity = serializers.DecimalField(max_digits=15, decimal_places=4) # Explicitly declare for write validation

    class Meta:
        model = PortfolioAssets
        fields = [
            'ID',
            'portfolio',
            'asset',
            'asset_id',
            'quantity',
            'average_price',
            'total_value',
        ]
        read_only_fields = ['average_price', 'total_value', 'ID', 'portfolio', 'asset']


class DealsSerializer(serializers.ModelSerializer):
    asset_ticker = serializers.CharField(source='asset.ticker', read_only=True)
    asset = serializers.PrimaryKeyRelatedField(queryset=Assets.objects.all())
    portfolio = serializers.PrimaryKeyRelatedField(queryset=Portfolios.objects.all())

    class Meta:
        model = Deals
        fields = [
            'Deal_ID', 'portfolio', 'asset', 'address', 'status', 'type',
            'quantity', 'price', 'total', 'commission', 'tax', 'date',
            'asset_ticker',
        ]
        read_only_fields = ['Deal_ID']


class PortfoliosSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    portfolio_assets = PortfolioAssetsSerializer(
        many=True,
        read_only=True,
        source='portfolioassets_set'
    )

    class Meta:
        model = Portfolios
        fields = [
            'Port_ID', 'user', 'username', 'name', 'total_value', 'profit_loss',
            'yield_percent', 'annual_yield', 'created_at',
            'portfolio_assets',
        ]
        read_only_fields = [
            'Port_ID', 'user', 'username', 'total_value', 'profit_loss',
            'yield_percent', 'annual_yield', 'created_at'
        ]