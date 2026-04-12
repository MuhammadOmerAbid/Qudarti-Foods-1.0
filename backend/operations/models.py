from django.db import models
from django.utils import timezone


def list_default():
  return []


class TimeStampedModel(models.Model):
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  class Meta:
    abstract = True


class Brand(TimeStampedModel):
  name = models.CharField(max_length=120, unique=True)
  status = models.BooleanField(default=True)

  class Meta:
    ordering = ('name',)

  def __str__(self):
    return self.name


class Category(TimeStampedModel):
  name = models.CharField(max_length=120)
  brand = models.ForeignKey(
    Brand,
    null=True,
    blank=True,
    on_delete=models.SET_NULL,
    related_name='categories',
  )
  status = models.BooleanField(default=True)

  class Meta:
    unique_together = ('name', 'brand')
    ordering = ('name',)

  def __str__(self):
    return self.name


class Product(TimeStampedModel):
  name = models.CharField(max_length=180)
  brand = models.ForeignKey(
    Brand,
    null=True,
    blank=True,
    on_delete=models.SET_NULL,
    related_name='products',
  )
  category = models.ForeignKey(
    Category,
    null=True,
    blank=True,
    on_delete=models.SET_NULL,
    related_name='products',
  )
  status = models.BooleanField(default=True)

  class Meta:
    unique_together = ('name', 'category')
    ordering = ('name',)

  def __str__(self):
    return self.name


class Size(TimeStampedModel):
  name = models.CharField(max_length=120)
  product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sizes')

  class Meta:
    unique_together = ('name', 'product')

  def __str__(self):
    return self.name


class Packing(TimeStampedModel):
  name = models.CharField(max_length=120, unique=True)
  status = models.BooleanField(default=True)

  def __str__(self):
    return self.name


class Supplier(TimeStampedModel):
  name = models.CharField(max_length=180)
  address = models.TextField(blank=True, default='')
  contact = models.CharField(max_length=120, blank=True, default='')
  status = models.BooleanField(default=True)

  class Meta:
    ordering = ('name',)

  def __str__(self):
    return self.name


class Customer(TimeStampedModel):
  name = models.CharField(max_length=180)
  contact = models.CharField(max_length=120, blank=True, default='')
  address = models.TextField(blank=True, default='')
  status = models.BooleanField(default=True)

  class Meta:
    ordering = ('name',)

  def __str__(self):
    return self.name


class Recipe(TimeStampedModel):
  # Legacy API shape
  name = models.CharField(max_length=180, blank=True, default='')
  for_quantity = models.DecimalField(max_digits=14, decimal_places=3, default=1)
  for_unit = models.CharField(max_length=40, default='Kg')
  status = models.BooleanField(default=True)
  items = models.JSONField(default=list_default, blank=True)

  # Normalized shape
  product = models.ForeignKey(
    Product,
    null=True,
    blank=True,
    on_delete=models.SET_NULL,
    related_name='recipes',
  )

  def __str__(self):
    return self.name or (self.product.name if self.product else f'Recipe {self.pk}')


class RecipeItem(TimeStampedModel):
  recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='recipe_items')
  raw_material = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='used_in_recipes')
  quantity = models.DecimalField(max_digits=14, decimal_places=3)
  unit = models.CharField(max_length=40, default='Kg')

  def __str__(self):
    return f'{self.recipe_id} - {self.raw_material.name}'


class GateInward(TimeStampedModel):
  STATUS_RECEIVED = 'Received'
  STATUS_PENDING = 'Pending'
  STATUS_CHOICES = (
    (STATUS_RECEIVED, STATUS_RECEIVED),
    (STATUS_PENDING, STATUS_PENDING),
  )

  gr_no = models.CharField(max_length=50, unique=True)
  supplier = models.ForeignKey(
    Supplier,
    null=True,
    blank=True,
    on_delete=models.SET_NULL,
    related_name='gate_inwards',
  )
  supplier_name = models.CharField(max_length=180, blank=True, default='')
  address = models.TextField(blank=True, default='')
  note = models.TextField(blank=True, default='')
  receive_date = models.DateField(default=timezone.localdate)
  status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_RECEIVED)
  items = models.JSONField(default=list_default, blank=True)

  def __str__(self):
    return self.gr_no


class GateInwardItem(TimeStampedModel):
  gate_inward = models.ForeignKey(GateInward, on_delete=models.CASCADE, related_name='gate_inward_items')
  product = models.ForeignKey(Product, on_delete=models.PROTECT)
  quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
  unit = models.CharField(max_length=40, default='Unit')
  rate = models.DecimalField(max_digits=14, decimal_places=2, default=0)


class GateOutward(TimeStampedModel):
  # Legacy API shape
  product_name = models.CharField(max_length=180, blank=True, default='')
  customer_name = models.CharField(max_length=180, blank=True, default='')
  vehicle_no = models.CharField(max_length=80, blank=True, default='')
  driver_name = models.CharField(max_length=120, blank=True, default='')
  quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
  unit = models.CharField(max_length=40, default='Unit')
  dispatch_date = models.DateField(default=timezone.localdate)
  status = models.CharField(max_length=40, default='Dispatched')
  note = models.TextField(blank=True, default='')

  # Normalized shape
  customer = models.ForeignKey(Customer, null=True, blank=True, on_delete=models.SET_NULL)

  def __str__(self):
    return f'GO-{self.pk}'


class GateOutwardItem(TimeStampedModel):
  gate_outward = models.ForeignKey(GateOutward, on_delete=models.CASCADE, related_name='gate_outward_items')
  product = models.ForeignKey(Product, on_delete=models.PROTECT)
  quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
  unit = models.CharField(max_length=40, default='Unit')


class InventoryItem(TimeStampedModel):
  brand = models.CharField(max_length=120)
  category = models.CharField(max_length=120)
  product = models.CharField(max_length=180)
  subcategory = models.CharField(max_length=120, blank=True, default='')
  quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
  unit = models.CharField(max_length=40, default='Unit')
  comment = models.TextField(blank=True, default='')
  status = models.BooleanField(default=True)

  class Meta:
    ordering = ('brand', 'category', 'product')

  def __str__(self):
    return f'{self.brand} - {self.product}'


class InventoryHistory(TimeStampedModel):
  month = models.CharField(max_length=40)
  category = models.CharField(max_length=120)
  product = models.CharField(max_length=180)
  outgoing = models.DecimalField(max_digits=14, decimal_places=3, default=0)
  unit = models.CharField(max_length=40, default='Unit')

  class Meta:
    ordering = ('-created_at',)


class Inventory(TimeStampedModel):
  product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='inventory', null=True, blank=True)
  quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
  unit = models.CharField(max_length=40, default='Unit')
  reorder_level = models.DecimalField(max_digits=14, decimal_places=3, default=0)

  def __str__(self):
    return self.product.name if self.product else f'Inventory {self.pk}'


class InventoryTransaction(TimeStampedModel):
  TRANSACTION_TYPES = (
    ('IN', 'IN'),
    ('OUT', 'OUT'),
    ('ADJUST', 'ADJUST'),
  )

  product = models.ForeignKey(Product, on_delete=models.PROTECT, null=True, blank=True)
  transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
  quantity = models.DecimalField(max_digits=14, decimal_places=3)
  unit = models.CharField(max_length=40, default='Unit')
  remarks = models.TextField(blank=True, default='')


class Requisition(TimeStampedModel):
  receiver_name = models.CharField(max_length=180)
  entry_by = models.CharField(max_length=180, blank=True, default='')
  entry_date = models.DateField(default=timezone.localdate)
  comment = models.TextField(blank=True, default='')
  items = models.JSONField(default=list_default, blank=True)

  def __str__(self):
    return f'REQ-{self.pk}'


class RequisitionItem(TimeStampedModel):
  requisition = models.ForeignKey(Requisition, on_delete=models.CASCADE, related_name='requisition_items')
  product = models.ForeignKey(Product, on_delete=models.PROTECT)
  quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
  unit = models.CharField(max_length=40, default='Unit')


class DailyProduction(TimeStampedModel):
  # Legacy API shape
  date = models.DateField(default=timezone.localdate)
  note = models.TextField(blank=True, default='')
  entries = models.JSONField(default=list_default, blank=True)

  # Normalized shape
  production_order = models.ForeignKey(
    'ProductionOrder',
    null=True,
    blank=True,
    on_delete=models.SET_NULL,
    related_name='daily_entries',
  )
  produced_quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)


class ProductionOrder(TimeStampedModel):
  # Legacy API shape
  name = models.CharField(max_length=180, blank=True, default='')
  date = models.DateField(default=timezone.localdate)
  status = models.CharField(max_length=40, default='Pending')
  items = models.JSONField(default=list_default, blank=True)

  # Normalized shape
  product = models.ForeignKey(Product, null=True, blank=True, on_delete=models.SET_NULL)
  quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
  unit = models.CharField(max_length=40, default='Unit')

  def __str__(self):
    return self.name or (self.product.name if self.product else f'PO-{self.pk}')


class FinishedGoods(TimeStampedModel):
  # Legacy API shape
  brand = models.CharField(max_length=120, blank=True, default='')
  date = models.DateField(default=timezone.localdate)
  status = models.CharField(max_length=40, default='Completed')
  products = models.JSONField(default=list_default, blank=True)

  # Normalized shape
  product = models.ForeignKey(Product, null=True, blank=True, on_delete=models.SET_NULL)
  quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
  unit = models.CharField(max_length=40, default='Unit')

  def __str__(self):
    if self.product:
      return self.product.name
    return self.brand or f'FG-{self.pk}'
