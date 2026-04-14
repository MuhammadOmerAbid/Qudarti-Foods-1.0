from django.contrib import admin

from .models import (
  Brand,
  Category,
  Product,
  Size,
  Packing,
  Supplier,
  Customer,
  Recipe,
  GateInward,
  GateOutward,
  InventoryItem,
  InventoryHistory,
  Requisition,
  DailyProduction,
  ProductionOrder,
  FinishedGoods,
)

admin.site.register(Brand)
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Size)
admin.site.register(Packing)
admin.site.register(Supplier)
admin.site.register(Customer)
admin.site.register(Recipe)
admin.site.register(GateInward)
admin.site.register(GateOutward)
admin.site.register(InventoryItem)
admin.site.register(InventoryHistory)
admin.site.register(Requisition)
admin.site.register(DailyProduction)
admin.site.register(ProductionOrder)
admin.site.register(FinishedGoods)
