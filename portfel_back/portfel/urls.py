# portfel_back/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework_nested import routers
from portfel_online import views

router = routers.DefaultRouter()
router.register(r'asset-types', views.AssetTypesViewSet)
router.register(r'deal-sources', views.DealSourceViewSet)
router.register(r'assets', views.AssetsViewSet)
router.register(r'portfolios', views.PortfoliosViewSet, basename='portfolio')
router.register(r'portfolio-assets', views.PortfolioAssetsViewSet, basename='portfolioasset')
router.register(r'users', views.AuthUserViewSet)

portfolios_router = routers.NestedDefaultRouter(router, r'portfolios', lookup='portfolio')
portfolios_router.register(r'deals', views.DealsViewSet, basename='portfolio-deals')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(portfolios_router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('tinkoff/portfolio/', views.TinkoffPortfolioView.as_view(), name='tinkoff-portfolio'),
    # path('admin/', admin.site.urls),
]