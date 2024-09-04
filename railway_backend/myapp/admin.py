from django.contrib import admin
from .models import User, Station, Train, TrainClass, Route, Passenger, Payment

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass

@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    pass

@admin.register(Train)
class TrainAdmin(admin.ModelAdmin):
    pass

@admin.register(TrainClass)
class TrainClassAdmin(admin.ModelAdmin):
    pass

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    pass

@admin.register(Passenger)
class PassengerAdmin(admin.ModelAdmin):
    pass

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    pass
