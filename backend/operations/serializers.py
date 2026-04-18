from rest_framework import serializers
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


class BrandSerializer(serializers.ModelSerializer):
  class Meta:
    model = Brand
    fields = '__all__'


class CategorySerializer(serializers.ModelSerializer):
  brand_name = serializers.CharField(source='brand.name', read_only=True)

  class Meta:
    model = Category
    fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
  brand_name = serializers.CharField(source='brand.name', read_only=True)
  category_name = serializers.CharField(source='category.name', read_only=True)

  class Meta:
    model = Product
    fields = '__all__'


class SizeSerializer(serializers.ModelSerializer):
  product_name = serializers.CharField(source='product.name', read_only=True, allow_null=True)

  class Meta:
    model = Size
    fields = '__all__'

  def validate(self, attrs):
    name = (attrs.get('name') or getattr(self.instance, 'name', '')).strip()
    product = attrs.get('product', getattr(self.instance, 'product', None))

    if not name:
      raise serializers.ValidationError({'name': 'This field is required.'})

    attrs['name'] = name

    queryset = Size.objects.all()
    if self.instance:
      queryset = queryset.exclude(pk=self.instance.pk)

    if product is None:
      exists = queryset.filter(product__isnull=True, name__iexact=name).exists()
    else:
      exists = queryset.filter(product=product, name__iexact=name).exists()

    if exists:
      raise serializers.ValidationError({'name': 'This unit already exists.'})

    return attrs


class PackingSerializer(serializers.ModelSerializer):
  class Meta:
    model = Packing
    fields = '__all__'


class SupplierSerializer(serializers.ModelSerializer):
  class Meta:
    model = Supplier
    fields = '__all__'


class CustomerSerializer(serializers.ModelSerializer):
  class Meta:
    model = Customer
    fields = '__all__'


class RecipeSerializer(serializers.ModelSerializer):
  class Meta:
    model = Recipe
    fields = '__all__'


class GateInwardSerializer(serializers.ModelSerializer):
  supplier_name = serializers.CharField(required=False, allow_blank=True)

  class Meta:
    model = GateInward
    fields = '__all__'

  def validate(self, attrs):
    supplier = attrs.get('supplier')
    if supplier and not attrs.get('supplier_name'):
      attrs['supplier_name'] = supplier.name
      if not attrs.get('address'):
        attrs['address'] = supplier.address
    return attrs


class GateOutwardSerializer(serializers.ModelSerializer):
  class Meta:
    model = GateOutward
    fields = '__all__'


class InventoryItemSerializer(serializers.ModelSerializer):
  class Meta:
    model = InventoryItem
    fields = '__all__'


class InventoryHistorySerializer(serializers.ModelSerializer):
  class Meta:
    model = InventoryHistory
    fields = '__all__'


class RequisitionSerializer(serializers.ModelSerializer):
  class Meta:
    model = Requisition
    fields = '__all__'


class DailyProductionSerializer(serializers.ModelSerializer):
  class Meta:
    model = DailyProduction
    fields = '__all__'


class ProductionOrderSerializer(serializers.ModelSerializer):
  class Meta:
    model = ProductionOrder
    fields = '__all__'


class FinishedGoodsSerializer(serializers.ModelSerializer):
  class Meta:
    model = FinishedGoods
    fields = '__all__'
