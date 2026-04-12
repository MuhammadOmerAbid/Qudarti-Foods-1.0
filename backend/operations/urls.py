from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
  BrandViewSet,
  CategoryViewSet,
  ProductViewSet,
  SizeViewSet,
  PackingViewSet,
  SupplierViewSet,
  CustomerViewSet,
  RecipeViewSet,
  GateInwardViewSet,
  GateOutwardViewSet,
  InventoryViewSet,
  RequisitionViewSet,
  DailyProductionViewSet,
  ProductionOrderViewSet,
  FinishedGoodsViewSet,
  DashboardTodayView,
)

router = DefaultRouter()
router.register('brands', BrandViewSet, basename='brands')
router.register('categories', CategoryViewSet, basename='categories')
router.register('products', ProductViewSet, basename='products')
router.register('sizes', SizeViewSet, basename='sizes')
router.register('packing', PackingViewSet, basename='packing')
router.register('suppliers', SupplierViewSet, basename='suppliers')
router.register('customers', CustomerViewSet, basename='customers')
router.register('recipes', RecipeViewSet, basename='recipes')
router.register('gate-inward', GateInwardViewSet, basename='gate-inward')
router.register('gate-outward', GateOutwardViewSet, basename='gate-outward')
router.register('inventory', InventoryViewSet, basename='inventory')
router.register('requisitions', RequisitionViewSet, basename='requisitions')
router.register('daily-production', DailyProductionViewSet, basename='daily-production')
router.register('production-orders', ProductionOrderViewSet, basename='production-orders')
router.register('finished-goods', FinishedGoodsViewSet, basename='finished-goods')

urlpatterns = [
  path('', include(router.urls)),
  path('dashboard/today/', DashboardTodayView.as_view(), name='dashboard-today'),
]
