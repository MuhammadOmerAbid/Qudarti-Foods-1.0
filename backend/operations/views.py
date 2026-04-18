import csv
from datetime import date
from decimal import Decimal

from django.db.models import Max
from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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
from .serializers import (
  BrandSerializer,
  CategorySerializer,
  ProductSerializer,
  SizeSerializer,
  PackingSerializer,
  SupplierSerializer,
  CustomerSerializer,
  RecipeSerializer,
  GateInwardSerializer,
  GateOutwardSerializer,
  InventoryItemSerializer,
  InventoryHistorySerializer,
  RequisitionSerializer,
  DailyProductionSerializer,
  ProductionOrderSerializer,
  FinishedGoodsSerializer,
)


def to_text(value):
  if value is None:
    return ''
  return str(value)


def csv_response(filename, headers, rows):
  response = HttpResponse(content_type='text/csv')
  response['Content-Disposition'] = f'attachment; filename="{filename}"'
  writer = csv.writer(response)
  writer.writerow(headers)
  for row in rows:
    writer.writerow([to_text(col) for col in row])
  return response


class BaseModelViewSet(viewsets.ModelViewSet):
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    queryset = self.queryset
    status_filter = self.request.query_params.get('status')
    if not status_filter:
      return queryset

    filter_value = status_filter.strip().lower()
    status_field = self.queryset.model._meta.get_field('status') if any(
      f.name == 'status' for f in self.queryset.model._meta.fields
    ) else None

    if status_field is None:
      return queryset

    if status_field.get_internal_type() == 'BooleanField':
      if filter_value in ('active', 'true', '1'):
        return queryset.filter(status=True)
      if filter_value in ('inactive', 'false', '0'):
        return queryset.filter(status=False)
      return queryset

    # String status fields
    return queryset.filter(status__iexact=status_filter)


class BrandViewSet(BaseModelViewSet):
  queryset = Brand.objects.all().order_by('name')
  serializer_class = BrandSerializer


class CategoryViewSet(BaseModelViewSet):
  queryset = Category.objects.select_related('brand').all().order_by('name')
  serializer_class = CategorySerializer


class ProductViewSet(BaseModelViewSet):
  queryset = Product.objects.select_related('brand', 'category').all().order_by('name')
  serializer_class = ProductSerializer


class SizeViewSet(BaseModelViewSet):
  queryset = Size.objects.select_related('product').all().order_by('name')
  serializer_class = SizeSerializer

  def get_queryset(self):
    queryset = super().get_queryset()
    include_product = (self.request.query_params.get('include_product') or '').strip().lower()
    if include_product in ('1', 'true', 'yes'):
      return queryset
    return queryset.filter(product__isnull=True)


class PackingViewSet(BaseModelViewSet):
  queryset = Packing.objects.all().order_by('name')
  serializer_class = PackingSerializer


class SupplierViewSet(BaseModelViewSet):
  queryset = Supplier.objects.all().order_by('name')
  serializer_class = SupplierSerializer


class CustomerViewSet(BaseModelViewSet):
  queryset = Customer.objects.all().order_by('name')
  serializer_class = CustomerSerializer


class RecipeViewSet(BaseModelViewSet):
  queryset = Recipe.objects.all().order_by('-id')
  serializer_class = RecipeSerializer

  @action(detail=True, methods=['post'], url_path='scale')
  def scale(self, request, pk=None):
    recipe = self.get_object()
    desired_quantity = Decimal(str(request.data.get('desired_quantity', 0) or 0))
    if desired_quantity <= 0:
      return Response({'detail': 'desired_quantity must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)

    base_qty = Decimal(str(recipe.for_quantity or 1))
    if base_qty <= 0:
      base_qty = Decimal('1')

    ratio = desired_quantity / base_qty
    scaled_items = []
    for item in recipe.items or []:
      try:
        qty = Decimal(str(item.get('quantity', 0) or 0))
      except Exception:
        qty = Decimal('0')
      scaled_items.append({
        **item,
        'scaled_qty': str((qty * ratio).quantize(Decimal('0.001'))),
      })

    return Response({
      'id': recipe.id,
      'name': recipe.name,
      'for_unit': recipe.for_unit,
      'desired_quantity': str(desired_quantity),
      'items': scaled_items,
    })


class GateInwardViewSet(BaseModelViewSet):
  queryset = GateInward.objects.select_related('supplier').all().order_by('-id')
  serializer_class = GateInwardSerializer

  @action(detail=False, methods=['get'], url_path='next-gr')
  def next_gr(self, _request):
    rows = GateInward.objects.filter(gr_no__startswith='QUD').values_list('gr_no', flat=True)
    numbers = []
    for gr_no in rows:
      suffix = ''.join(ch for ch in str(gr_no).replace('QUD', '') if ch.isdigit())
      if suffix:
        numbers.append(int(suffix))
    next_no = (max(numbers) + 1) if numbers else 1
    return Response({'gr_no': f'QUD{next_no}'})

  @action(detail=False, methods=['get'], url_path='report')
  def report(self, _request):
    headers = ['GR No', 'Supplier', 'Address', 'Brand', 'Category', 'Product', 'Quantity', 'Receive Date', 'Status', 'Note']
    rows = []
    for record in self.get_queryset():
      items = record.items or [{}]
      for item in items:
        quantity = item.get('quantity', '')
        unit = item.get('unit', '')
        rows.append([
          record.gr_no,
          record.supplier_name,
          record.address,
          item.get('brandName') or item.get('brand_name') or '',
          item.get('categoryName') or item.get('category_name') or '',
          item.get('productName') or item.get('product_name') or '',
          f'{quantity} {unit}'.strip(),
          record.receive_date,
          record.status,
          record.note,
        ])
    return csv_response('gate-inward-report.csv', headers, rows)


class GateOutwardViewSet(BaseModelViewSet):
  queryset = GateOutward.objects.all().order_by('-id')
  serializer_class = GateOutwardSerializer

  @action(detail=False, methods=['get'], url_path='report')
  def report(self, _request):
    headers = ['Product', 'Customer', 'Vehicle', 'Driver', 'Quantity', 'Date', 'Status', 'Note']
    rows = [
      [
        row.product_name,
        row.customer_name,
        row.vehicle_no,
        row.driver_name,
        f'{row.quantity} {row.unit}'.strip(),
        row.dispatch_date,
        row.status,
        row.note,
      ]
      for row in self.get_queryset()
    ]
    return csv_response('gate-outward-report.csv', headers, rows)


class InventoryViewSet(BaseModelViewSet):
  queryset = InventoryItem.objects.all().order_by('brand', 'category', 'product')
  serializer_class = InventoryItemSerializer

  @action(detail=False, methods=['get'], url_path='history')
  def history(self, _request):
    rows = InventoryHistory.objects.all().order_by('-created_at')
    return Response(InventoryHistorySerializer(rows, many=True).data)

  @action(detail=False, methods=['get'], url_path='report')
  def report(self, _request):
    headers = ['Brand', 'Category', 'Product', 'Sub-Category', 'Quantity', 'Unit', 'Comment']
    rows = [
      [row.brand, row.category, row.product, row.subcategory, row.quantity, row.unit, row.comment]
      for row in self.get_queryset()
    ]
    return csv_response('inventory-report.csv', headers, rows)


class RequisitionViewSet(BaseModelViewSet):
  queryset = Requisition.objects.all().order_by('-id')
  serializer_class = RequisitionSerializer

  @action(detail=False, methods=['post'], url_path='return')
  def return_goods(self, request):
    req_id = request.data.get('record_id') or request.data.get('requisition_id') or request.data.get('id')
    item_idx = request.data.get('item_idx')
    return_qty = Decimal(str(request.data.get('return_qty', 0) or 0))

    if not req_id:
      return Response({'detail': 'record_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    if return_qty <= 0:
      return Response({'detail': 'return_qty must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)

    requisition = Requisition.objects.filter(pk=req_id).first()
    if not requisition:
      return Response({'detail': 'Requisition not found'}, status=status.HTTP_404_NOT_FOUND)

    items = list(requisition.items or [])
    if not items:
      return Response({'detail': 'No items found on requisition'}, status=status.HTTP_400_BAD_REQUEST)

    idx = int(item_idx) if item_idx is not None else 0
    if idx < 0 or idx >= len(items):
      return Response({'detail': 'Invalid item_idx'}, status=status.HTTP_400_BAD_REQUEST)

    target = items[idx]
    issued = Decimal(str(target.get('quantity', 0) or 0))
    already_returned = Decimal(str(target.get('returned', 0) or 0))
    max_returnable = issued - already_returned

    if return_qty > max_returnable:
      return Response({'detail': f'Max returnable is {max_returnable}'}, status=status.HTTP_400_BAD_REQUEST)

    target['returned'] = float(already_returned + return_qty)
    items[idx] = target
    requisition.items = items
    requisition.save(update_fields=['items', 'updated_at'])

    return Response(RequisitionSerializer(requisition).data)

  @action(detail=False, methods=['get'], url_path='report')
  def report(self, _request):
    headers = ['Receiver Name', 'Entry By', 'Entry Date', 'Product', 'Sub-Category', 'Category', 'Issued Qty', 'Returned Qty', 'Net Qty', 'Unit', 'Comment']
    rows = []
    for record in self.get_queryset():
      for item in record.items or [{}]:
        issued = Decimal(str(item.get('quantity', 0) or 0))
        returned = Decimal(str(item.get('returned', 0) or 0))
        rows.append([
          record.receiver_name,
          record.entry_by,
          record.entry_date,
          item.get('productName') or item.get('product_name') or '',
          item.get('subCategory') or item.get('sub_category') or '',
          item.get('category') or '',
          issued,
          returned,
          issued - returned,
          item.get('unit') or 'Unit',
          record.comment,
        ])
    return csv_response('requisition-report.csv', headers, rows)


class DailyProductionViewSet(BaseModelViewSet):
  queryset = DailyProduction.objects.all().order_by('-date', '-id')
  serializer_class = DailyProductionSerializer

  @action(detail=False, methods=['get'], url_path='report')
  def report(self, _request):
    headers = ['Date', 'Product', 'Start Time', 'End Time', 'No Of Labour', 'Note']
    rows = []
    for record in self.get_queryset():
      for entry in record.entries or [{}]:
        rows.append([
          record.date,
          entry.get('product') or '',
          entry.get('startTime') or entry.get('start_time') or '',
          entry.get('endTime') or entry.get('end_time') or '',
          entry.get('noOfLabour') or entry.get('no_of_labour') or '',
          record.note,
        ])
    return csv_response('daily-production-report.csv', headers, rows)


class ProductionOrderViewSet(BaseModelViewSet):
  queryset = ProductionOrder.objects.all().order_by('-date', '-id')
  serializer_class = ProductionOrderSerializer

  @action(detail=True, methods=['patch'], url_path='items/(?P<item_id>[^/.]+)')
  def update_item_status(self, request, pk=None, item_id=None):
    order = self.get_object()
    new_status = request.data.get('status')
    if not new_status:
      return Response({'detail': 'status is required'}, status=status.HTTP_400_BAD_REQUEST)

    items = list(order.items or [])
    updated = False
    for index, item in enumerate(items):
      current_id = str(item.get('id') or item.get('sr') or (index + 1))
      if current_id == str(item_id):
        item['status'] = new_status
        items[index] = item
        updated = True
        break

    if not updated:
      return Response({'detail': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

    order.items = items
    order.save(update_fields=['items', 'updated_at'])
    return Response(ProductionOrderSerializer(order).data)

  @action(detail=False, methods=['get'], url_path='report')
  def report(self, _request):
    headers = ['Order Name', 'Date', 'Goods', 'Packing', 'Qty', 'Status']
    rows = []
    for order in self.get_queryset():
      for item in order.items or [{}]:
        rows.append([
          order.name,
          order.date,
          item.get('goods') or '',
          item.get('packing') or '',
          item.get('qty') or item.get('quantity') or '',
          item.get('status') or order.status,
        ])
    return csv_response('production-order-report.csv', headers, rows)


class FinishedGoodsViewSet(BaseModelViewSet):
  queryset = FinishedGoods.objects.all().order_by('-date', '-id')
  serializer_class = FinishedGoodsSerializer


class DashboardTodayView(APIView):
  permission_classes = [IsAuthenticated]

  def get(self, _request):
    today = date.today()
    data = {
      'date': today,
      'gate_inward_today': GateInward.objects.filter(receive_date=today).count(),
      'gate_outward_today': GateOutward.objects.filter(dispatch_date=today).count(),
      'requisitions_today': Requisition.objects.filter(entry_date=today).count(),
      'daily_production_today': DailyProduction.objects.filter(date=today).count(),
      'pending_production_orders': ProductionOrder.objects.filter(status__iexact='Pending').count(),
      'finished_goods_today': FinishedGoods.objects.filter(date=today).count(),
      'inventory_items': InventoryItem.objects.count(),
      'active_brands': Brand.objects.filter(status=True).count(),
      'active_products': Product.objects.filter(status=True).count(),
    }
    return Response(data)
