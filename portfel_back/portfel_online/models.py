from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()
class AssetTypes(models.Model):
    Type_ID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    risk_level = models.IntegerField()
    liquidity = models.IntegerField()

    class Meta:
        managed = True
        db_table = 'asset_types'

class Assets(models.Model):
    Asset_ID = models.AutoField(primary_key=True)
    ISIN = models.CharField(max_length=255)
    ticker = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    region = models.CharField(max_length=255)
    exchange = models.CharField(max_length=255)
    market = models.CharField(max_length=255)
    trading_type = models.CharField(max_length=255)
    management_fee = models.DecimalField (max_digits=5, decimal_places=2)
    currency = models.CharField(max_length=255)
    description = models.TextField()
    dividend_yield = models.DecimalField (max_digits=5, decimal_places=2)
    pe_ratio = models.DecimalField(max_digits=10, decimal_places=2)
    pb_ratio = models.DecimalField(max_digits=10, decimal_places=2)
    beta = models.DecimalField(max_digits=5, decimal_places=2)
    current_price = models.DecimalField(
        max_digits=12, decimal_places=4, null=True, blank=True
    )
    asset_type = models.ForeignKey(AssetTypes, on_delete=models.PROTECT) # Изменено с DO_NOTHING и asset_type_id

    class Meta:
        managed = True
        db_table = 'assets'

class AuthUser(models.Model):
    id = models.AutoField(primary_key=True)
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=255)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'

class Portfolios(models.Model):
    Port_ID = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    total_value = models.IntegerField(default=0)
    profit_loss = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    yield_percent = models.DecimalField(max_digits=7, decimal_places=4, default=0)
    annual_yield = models.DecimalField(max_digits=7, decimal_places=4, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'portfolios'

class PortfolioAssets(models.Model):
    ID = models.AutoField(primary_key=True)
    portfolio = models.ForeignKey(Portfolios, on_delete=models.CASCADE) # Изменено с portfolio_id
    asset = models.ForeignKey(Assets, on_delete=models.PROTECT) # Добавлено поле связи с Assets
    quantity = models.DecimalField(max_digits=15, decimal_places=4) # Увеличена точность
    average_price = models.DecimalField(max_digits=12, decimal_places=4) # Увеличена точность, оставляем по запросу
    total_value = models.DecimalField(max_digits=15, decimal_places=2) # Увеличена точность, оставляем по запросу

    class Meta:
        managed = True
        db_table = 'portfolios_assets'
        unique_together = ('portfolio', 'asset') # Добавлено ограничение уникальности

class Deals(models.Model):
    Deal_ID = models.AutoField(primary_key=True)
    portfolio = models.ForeignKey(Portfolios, on_delete=models.CASCADE) # Изменено с portfolio_id
    asset = models.ForeignKey(Assets, on_delete=models.PROTECT) # Изменено с asset_id и CASCADE
    address = models.CharField(max_length=255)
    status = models.CharField(max_length=255)
    type = models.BooleanField(blank=True)
    quantity = models.DecimalField(max_digits=15, decimal_places=4) # Увеличена точность
    price = models.DecimalField(max_digits=12, decimal_places=4) # Увеличена точность
    total = models.DecimalField(max_digits=15, decimal_places=2) # Увеличена точность, оставляем по запросу
    commission = models.DecimalField(max_digits=10, decimal_places=2) # Увеличена точность
    tax = models.DecimalField(max_digits=10, decimal_places=2) # Увеличена точность
    date = models.DateTimeField()

    class Meta:
        managed = True
        db_table = 'deals'

class DealSource(models.Model):
    Source_ID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    api_url = models.CharField(max_length=255)
    api_key = models.CharField(max_length=255)

    class Meta:
        managed = True
        db_table = 'deal_sources'