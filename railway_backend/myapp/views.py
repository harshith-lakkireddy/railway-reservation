from rest_framework import viewsets, response, status
from .models import User, Station, Train, TrainClass, Route, Passenger, Payment
from .serializers import UserSerializer, StationSerializer, TrainSerializer, TrainClassSerializer, RouteSerializer, PassengerSerializer, PaymentSerializer
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        errors = {}
        for field, value in response.data.items():
            errors[field] = value[0]  # Get the first error message for each field
        response.data = {'errors': errors}

    return response

# Use the custom exception handler in your views
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return response.Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return response.Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        instance.delete()

class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer

class TrainViewSet(viewsets.ModelViewSet):
    queryset = Train.objects.all()
    serializer_class = TrainSerializer

class TrainClassViewSet(viewsets.ModelViewSet):
    queryset = TrainClass.objects.all()
    serializer_class = TrainClassSerializer

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer

class PassengerViewSet(viewsets.ModelViewSet):
    queryset = Passenger.objects.all()
    serializer_class = PassengerSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

class TrainClassByTrainIDViewSet(viewsets.ViewSet):
    serializer_class = TrainClassSerializer

    def list(self, request, train_id=None):
        queryset = TrainClass.objects.filter(train=train_id)
        serializer = TrainClassSerializer(queryset, many=True)
        return response.Response(serializer.data)
    
class RoutesByTrainIDViewSet(viewsets.ViewSet):
    serializer_class = RouteSerializer

    def list(self, request, train_id=None):
        queryset = Route.objects.filter(train=train_id)
        serializer = RouteSerializer(queryset, many=True)
        return response.Response(serializer.data)

class RouteByOriginAndDestinationViewSet(viewsets.ViewSet):
    serializer_class = RouteSerializer

    def list(self, request, origin_id=None, destination_id=None):
        final_response = []
        queryset = Route.objects.filter(origin=origin_id)
        seria = RouteSerializer(queryset, many=True)
        for route in seria.data:
            start = 0
            total_duration_minutes = 0
            start = route['id'].split("-")[1]
            if route['origin'] == origin_id and route['destination'] == destination_id:
                final_response.append({
                    "route" : f"{route['origin']}-{route['destination']}",
                    "duration" : route['duration'],
                    "train": route['train']
                })  
                continue

            response_str = f"{origin_id}"
            destination_found = False
            queryset1 = Route.objects.filter(train=route['train'])
            serializer = RouteSerializer(queryset1, many=True)
            for i in range(int(start) + 1, int(start) + len(serializer.data) + 1):
                queryset2 = Route.objects.filter(id=f"{route['train']}-{i}")
                serializer2 = RouteSerializer(queryset2, many=True)
                obj = serializer2.data[0] if serializer2.data else None
                if obj and obj['destination'] == destination_id:
                    destination_found = True
                    response_str += "-" + obj["origin"] + "-" + obj['destination']
                    total_duration_minutes += int(obj['duration'].split(":")[0]) * 60 + int(obj['duration'].split(":")[1])
                    break
                elif obj:
                    response_str += "-" + obj['origin']
                    total_duration_minutes += int(obj['duration'].split(":")[0]) * 60 + int(obj['duration'].split(":")[1])

            if destination_found:
                hours = total_duration_minutes // 60
                minutes = total_duration_minutes % 60
                total_duration_str = f"{hours:02}:{minutes:02}"
                final = {
                    "route" : response_str,
                    "duration" : total_duration_str + ":00",
                    "train": route['train']
                }
                final_response.append(final)
                continue

            if not destination_found:
                pass

        return response.Response(final_response)