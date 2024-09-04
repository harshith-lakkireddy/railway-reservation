from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'stations', views.StationViewSet, basename='station')
router.register(r'trains', views.TrainViewSet, basename='train')
router.register(r'train-classes', views.TrainClassViewSet, basename='trainclass')
router.register(r'routes', views.RouteViewSet, basename='route')
router.register(r'passengers', views.PassengerViewSet, basename='passenger')
router.register(r'payments', views.PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('classes/<str:train_id>/', views.TrainClassByTrainIDViewSet.as_view({'get': 'list'}), name='train-classes-by-train-id'),
    path('route/<str:train_id>/', views.RoutesByTrainIDViewSet.as_view({'get': 'list'}), name='routes-by-train-id'),
    path('routess/<str:origin_id>-<str:destination_id>/', views.RouteByOriginAndDestinationViewSet.as_view({'get': 'list'}), name='route-by-origin-and-destination'),
]
