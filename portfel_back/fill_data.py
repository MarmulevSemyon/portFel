import os
import django
import random
from datetime import datetime, timedelta
from django.utils import timezone
from decimal import Decimal, ROUND_HALF_UP
from django.db.models import Max
from django.db import transaction
from django.contrib.auth import get_user_model # <--- ИМПОРТИРОВАТЬ

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfel.settings')
django.setup()

# Используем стандартную модель User
User = get_user_model() # <--- ПОЛУЧИТЬ МОДЕЛЬ USER

# Импортируем модели из вашего приложения
from portfel_online.models import AssetTypes, Assets, Portfolios, PortfolioAssets, Deals, DealSource
# НЕ ИМПОРТИРУЕМ AuthUser, она не нужна

NUM_PORTFOLIOS = 5
NUM_ASSETS = 20
NUM_ASSETS_PER_PORTFOLIO = 10
NUM_DEALS_PER_PORTFOLIO = 5

# --- ИСПРАВЛЕННАЯ функция get_or_create_user ---
def get_or_create_user():
    # Работаем с User моделью из get_user_model()
    user, created = User.objects.get_or_create(
        username='123', # Убедитесь, что такой пользователь существует или будет создан
        defaults={
            # Используем стандартные поля модели User
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'test123user@example.com', # Уникальный email
            'is_staff': False, # Boolean
            'is_active': True,  # Boolean
            # 'date_joined': timezone.now() # Обычно устанавливается автоматически
            # Пароль нужно устанавливать отдельно и хешировать
        }
    )
    if created:
        user.set_password('your_secure_password') # <--- УСТАНОВИТЕ НАДЕЖНЫЙ ПАРОЛЬ!
        user.save()
        print(f"Создан тестовый пользователь: {user.username}")
    else:
         # Если пользователь уже существует, убедимся, что у него есть пароль (на случай первого запуска)
         if not user.password:
              user.set_password('your_secure_password') # Установите тот же пароль
              user.save()
         print(f"Используется существующий пользователь: {user.username}")
    return user

# --- (create_asset_types - без изменений) ---
def create_asset_types():
    types_data = [
        {'name': 'Акции', 'risk_level': 3, 'liquidity': 3},
        {'name': 'Облигации', 'risk_level': 1, 'liquidity': 2},
        {'name': 'Фонды (ETF)', 'risk_level': 2, 'liquidity': 3},
        {'name': 'Криптовалюта', 'risk_level': 5, 'liquidity': 4},
        {'name': 'Недвижимость', 'risk_level': 2, 'liquidity': 1},
    ]
    created_types = []
    for t in types_data:
        type_obj, _ = AssetTypes.objects.get_or_create(name=t['name'], defaults=t)
        created_types.append(type_obj)
    print(f"Создано/найдено {len(created_types)} типов активов.")
    return AssetTypes.objects.all()


# --- (create_assets - без изменений, т.к. не использует User) ---
def create_assets(asset_types, count=NUM_ASSETS):
    created_assets = []
    base_tickers = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'SBER', 'GAZP', 'LKOH', 'NVTK', 'ROSN', 'GMKN', 'PLZL', 'POLY', 'YNDX', 'MAIL', 'BTC', 'ETH', 'VNQ', 'BND', 'VT']

    try:
        last_id = Assets.objects.aggregate(max_id=Max('Asset_ID'))['max_id'] or 0
    except Exception:
        last_id = 0
    next_asset_id = last_id + 1

    for i in range(count):
        if i < len(base_tickers):
            ticker = base_tickers[i]
        else:
            ticker = f"GEN{random.randint(1000, 9999)}{i}"
            while Assets.objects.filter(ticker=ticker).exists():
                 ticker = f"GEN{random.randint(1000, 9999)}{i}"

        base_price = Decimal(str(round(random.uniform(5, 6000), 4)))
        current_price = (base_price * Decimal(str(round(random.uniform(0.9, 1.1), 4)))).quantize(Decimal("0.0001"))

        asset_data = {
            'ISIN': f"US{random.randint(1000000000, 9999999999)}{i}",
            'ticker': ticker,
            'company': f"Company {ticker}",
            'country': random.choice(['USA', 'Russia', 'Germany', 'Global']),
            'region': random.choice(['North America', 'Europe', 'Asia', 'Global']),
            'exchange': random.choice(['NASDAQ', 'MOEX', 'NYSE', 'LSE', 'CRYPTO']),
            'market': random.choice(['Stocks', 'Bonds', 'ETF', 'Crypto']),
            'trading_type': 'Common Stock' if ticker not in ['BTC', 'ETH'] else 'Crypto',
            'management_fee': Decimal(str(round(random.uniform(0, 0.5), 2))),
            'currency': random.choice(['USD', 'RUB', 'EUR']),
            'description': f"Description for {ticker}",
            'dividend_yield': Decimal(str(round(random.uniform(0, 5), 2))),
            'pe_ratio': Decimal(str(round(random.uniform(5, 100), 2))),
            'pb_ratio': Decimal(str(round(random.uniform(1, 10), 2))),
            'beta': Decimal(str(round(random.uniform(0.5, 2.5), 2))),
            'current_price': current_price,
            'asset_type': random.choice(asset_types)
        }

        defaults_with_id = asset_data.copy()
        defaults_with_id['Asset_ID'] = next_asset_id

        asset_obj, created = Assets.objects.get_or_create(
            ticker=asset_data['ticker'],
            defaults=defaults_with_id
        )

        if not created and asset_obj.current_price != current_price:
             asset_obj.current_price = current_price
             asset_obj.save(update_fields=['current_price'])

        if created:
            created_assets.append(asset_obj)
            print(f"Создан актив: {asset_obj.ticker} с Asset_ID={next_asset_id}, Current Price={current_price}")
            next_asset_id += 1

    print(f"Создано {len(created_assets)} новых активов. Всего: {Assets.objects.count()}.")
    return Assets.objects.all()

# --- (create_portfolios - теперь использует user правильного типа) ---
def create_portfolios(user, count=NUM_PORTFOLIOS):
    created_portfolios = []
    for i in range(count):
        portfolio_data = {
            'user': user, # <--- Теперь user это экземпляр User (из get_user_model)
            'name': f'Портфель {user.username} #{i+1}',
            'total_value': 0,
            'profit_loss': Decimal('0.00'),
            'yield_percent': Decimal('0.0000'),
            'annual_yield': Decimal('0.0000')
        }
        # get_or_create теперь будет работать корректно
        p_obj, created = Portfolios.objects.get_or_create(
            user=portfolio_data['user'],
            name=portfolio_data['name'],
            defaults=portfolio_data
        )
        if created:
            created_portfolios.append(p_obj)

    print(f"Создано {len(created_portfolios)} новых портфелей для пользователя {user.username}.")
    return Portfolios.objects.filter(user=user)


# --- (create_portfolio_assets - без изменений) ---
def create_portfolio_assets(portfolios, all_assets, assets_per_portfolio=NUM_ASSETS_PER_PORTFOLIO):
    created_portfolio_assets_count = 0
    updated_portfolio_assets_count = 0
    if not all_assets:
        print("Нет доступных активов для добавления в портфели.")
        return

    print("Наполнение портфелей активами...")
    for portfolio in portfolios:
        assets_to_add = random.sample(list(all_assets), min(len(all_assets), assets_per_portfolio))
        for asset in assets_to_add:
            quantity = Decimal(str(round(random.uniform(0.1, 500), 4)))
            average_price = (asset.current_price * Decimal(str(round(random.uniform(0.8, 1.2), 4)))).quantize(Decimal("0.0001")) if asset.current_price else Decimal('0.00')
            total_value = (quantity * asset.current_price).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) if asset.current_price else Decimal('0.00')

            pa_defaults = {
                'quantity': quantity,
                'average_price': average_price,
                'total_value': total_value
            }

            pa_obj, created = PortfolioAssets.objects.update_or_create(
                portfolio=portfolio,
                asset=asset,
                defaults=pa_defaults
            )
            if created:
                created_portfolio_assets_count += 1
            else:
                updated_portfolio_assets_count += 1

    print(f"Создано {created_portfolio_assets_count} / Обновлено {updated_portfolio_assets_count} записей PortfolioAssets.")

# --- (recalculate_all_portfolios - без изменений) ---
def recalculate_all_portfolios(portfolios):
    print("Пересчет агрегированных данных портфелей...")
    updated_count = 0
    for portfolio in portfolios:
        total_portfolio_value = Decimal('0.0')
        total_portfolio_cost = Decimal('0.0')

        with transaction.atomic():
            portfolio_assets = PortfolioAssets.objects.filter(portfolio=portfolio).select_related('asset')

            if not portfolio_assets.exists():
                portfolio.total_value = 0
                portfolio.profit_loss = Decimal('0.00')
                portfolio.yield_percent = Decimal('0.0000')
                portfolio.annual_yield = Decimal('0.0000')
                portfolio.save(update_fields=['total_value', 'profit_loss', 'yield_percent', 'annual_yield'])
                updated_count += 1
                continue

            for pa in portfolio_assets:
                current_price = pa.asset.current_price
                asset_total_value = Decimal('0.0')

                if current_price is not None and pa.quantity is not None:
                    asset_total_value = (pa.quantity * current_price).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                    total_portfolio_value += asset_total_value

                if pa.total_value != asset_total_value:
                     pa.total_value = asset_total_value
                     pa.save(update_fields=['total_value'])

                if pa.average_price is not None and pa.quantity is not None:
                   total_portfolio_cost += (pa.quantity * pa.average_price)

            total_portfolio_value = total_portfolio_value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            total_portfolio_cost = total_portfolio_cost.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            portfolio.total_value = int(total_portfolio_value) if total_portfolio_value == total_portfolio_value.to_integral_value() else total_portfolio_value

            profit_loss = total_portfolio_value - total_portfolio_cost
            portfolio.profit_loss = profit_loss

            if total_portfolio_cost > 0:
                yield_percent = (profit_loss / total_portfolio_cost) * 100
                portfolio.yield_percent = yield_percent.quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
            else:
                portfolio.yield_percent = Decimal('0.0000')

            portfolio.annual_yield = Decimal('0.0000')

            portfolio.save(update_fields=['total_value', 'profit_loss', 'yield_percent', 'annual_yield'])
            updated_count += 1

    print(f"Обновлено {updated_count} портфелей.")

# --- (create_deals - без изменений) ---
def create_deals(portfolios, deals_per_portfolio=NUM_DEALS_PER_PORTFOLIO):
    created_deals_count = 0
    print("Создание истории сделок...")
    for portfolio in portfolios:
        assets_in_portfolio = list(PortfolioAssets.objects.filter(portfolio=portfolio))
        if not assets_in_portfolio: continue
        for _ in range(deals_per_portfolio):
            portfolio_asset_entry = random.choice(assets_in_portfolio)
            asset = portfolio_asset_entry.asset
            base_deal_price = portfolio_asset_entry.average_price
            price = (base_deal_price * Decimal(str(round(random.uniform(0.95, 1.05), 4)))).quantize(Decimal("0.0001")) if base_deal_price else Decimal('1.0')
            deal_type = random.choice([True, False])
            max_q = portfolio_asset_entry.quantity / Decimal('2.0')
            quantity = Decimal(str(round(random.uniform(0.1, float(max_q)), 4))) if max_q > 0.1 else Decimal('0.1')
            total = (quantity * price).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            commission = (total * Decimal(str(round(random.uniform(0.0005, 0.005), 4)))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            tax = (total * Decimal('0.13') if not deal_type and total > 0 else Decimal('0')).quantize(Decimal("0.01"))
            Deals.objects.create(
                portfolio=portfolio, asset=asset, address='Generated Broker Report', status='Completed',
                type=deal_type, quantity=quantity, price=price, total=total, commission=commission, tax=tax,
                date=timezone.now() - timedelta(days=random.randint(1, 730))
            )
            created_deals_count += 1
    print(f"Создано {created_deals_count} новых сделок.")


# --- (create_deal_sources - без изменений) ---
def create_deal_sources():
    sources_data = [
        {'name': 'Tinkoff Broker', 'api_url': 'https://api-invest.tinkoff.ru/openapi/', 'api_key': 'your_key_here_1'},
        {'name': 'Interactive Brokers', 'api_url': 'https://api.interactivebrokers.com/v1/api', 'api_key': 'your_key_here_2'},
        {'name': 'Generated Data', 'api_url': '', 'api_key': ''}
    ]
    created_sources_count = 0
    for source in sources_data:
        _, created = DealSource.objects.get_or_create(name=source['name'], defaults=source)
        if created: created_sources_count += 1
    print(f"Создано/найдено {DealSource.objects.count()} источников сделок.")


# --- (clear_data - УБЕРИТЕ удаление User если он нужен для входа) ---
def clear_data():
    print("Удаление старых тестовых данных...")
    Deals.objects.all().delete()
    PortfolioAssets.objects.all().delete()
    # Найдем пользователя '123'
    user_to_keep = User.objects.filter(username='123').first()
    if user_to_keep:
         # Удаляем все портфели КРОМЕ тех, что принадлежат user_to_keep
         Portfolios.objects.exclude(user=user_to_keep).delete()
         # Удаляем портфели пользователя '123' отдельно, если это нужно (закомментировать если нет)
         # Portfolios.objects.filter(user=user_to_keep).delete()
         print(f"Портфели пользователя {user_to_keep.username} сохранены (или удалены, если строка выше раскомментирована).")
    else:
         # Если пользователя '123' нет, удаляем все портфели
         Portfolios.objects.all().delete()

    Assets.objects.all().delete()
    AssetTypes.objects.all().delete()
    DealSource.objects.all().delete()
    # AuthUser.objects.filter(username='123').delete() # Удаление кастомного пользователя не нужно
    print("Старые данные (кроме, возможно, портфелей пользователя '123') удалены.")


# --- (create_test_data - без изменений) ---
def create_test_data():
    clear_data()
    print("Создание тестовых данных...")

    user = get_or_create_user()
    if not user:
        print("Не удалось получить или создать пользователя. Выход.")
        return

    asset_types = create_asset_types()
    all_assets = create_assets(asset_types, count=NUM_ASSETS)
    user_portfolios = create_portfolios(user, count=NUM_PORTFOLIOS)
    create_portfolio_assets(user_portfolios, all_assets, assets_per_portfolio=NUM_ASSETS_PER_PORTFOLIO)
    recalculate_all_portfolios(user_portfolios)
    create_deals(user_portfolios, deals_per_portfolio=NUM_DEALS_PER_PORTFOLIO)
    create_deal_sources()

    print("-" * 20)
    print("Тестовые данные успешно созданы!")
    print(f"Пользователь: {user.username}")
    print(f"Портфелей создано/найдено для '{user.username}': {user_portfolios.count()}")
    print(f"Активов создано/найдено: {all_assets.count()}")
    print(f"Записей PortfolioAssets создано/найдено: {PortfolioAssets.objects.filter(portfolio__in=user_portfolios).count()}")
    print(f"Сделок создано: {Deals.objects.filter(portfolio__in=user_portfolios).count()}")
    print("-" * 20)


if __name__ == '__main__':
    create_test_data()