from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Stall
from .serializers import StallSerializer
from .permissions import IsSellerOrReadOnly

class StallViewSet(viewsets.ModelViewSet):
    queryset = Stall.objects.all().order_by("id")
    serializer_class = StallSerializer
    permission_classes = [IsSellerOrReadOnly]

    @action(detail=True, methods=["post"])
    def set_quantity(self, request, pk=None):
        stall = self.get_object()
        try:
            qty = int(request.data.get("quantity"))
        except (TypeError, ValueError):
            return Response({"detail": "quantity must be int"}, status=400)
        stall.quantity = max(0, qty)
        stall.save()
        return Response(self.get_serializer(stall).data)
