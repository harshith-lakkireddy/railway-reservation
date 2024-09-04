from django.db import models
from django.core.validators import MinLengthValidator

class User(models.Model):
    username = models.CharField(max_length=50, primary_key=True)
    password = models.CharField(max_length=30, validators=[MinLengthValidator(5)])

    #personal
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    age = models.IntegerField()
    gender = models.CharField(max_length=20)
    marital_stat = models.CharField(max_length=20)
    country = models.CharField(max_length=50)
    email = models.CharField(max_length=255, unique=True)
    phone = models.CharField(max_length=15, validators=[MinLengthValidator(10)], unique=True)

    #address
    flat_no = models.CharField(max_length=50)
    street = models.CharField(max_length=50)
    locality = models.CharField(max_length=50)
    pincode = models.CharField(max_length=50, validators=[MinLengthValidator(6)])
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)


class Station(models.Model):
    city = models.CharField(max_length=50)
    city_code = models.CharField(max_length=10, primary_key=True)
    junction = models.BooleanField()


class Train(models.Model):
    TYPE_CHOICES = [
        ('express', 'Express'),
        ('superfast', 'Superfast'),
        ('passenger', 'Passenger'),
    ]
    train_no = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    no_unreserved = models.IntegerField()
    no_sleeper = models.IntegerField()
    no_chair_car = models.IntegerField()
    no_3ac = models.IntegerField()
    no_2ac = models.IntegerField()
    no_1ac = models.IntegerField()
    runs = models.CharField(max_length=30)
    start_time = models.TimeField()

class TrainClass(models.Model):
    class_code = models.CharField(max_length=10)
    class_name = models.CharField(max_length=50)
    train = models.ForeignKey(Train, on_delete=models.CASCADE)
    fare = models.DecimalField(max_digits=8, decimal_places=2)
    
class Route(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    origin = models.ForeignKey(Station, related_name='origin_routes', on_delete=models.CASCADE)
    destination = models.ForeignKey(Station, related_name='destination_routes', on_delete=models.CASCADE)
    distance = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.TimeField()
    train = models.ForeignKey(Train, on_delete=models.CASCADE)

class Passenger(models.Model):
    ticket_id = models.CharField(max_length=30)
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=20)
    birth_preference = models.CharField(max_length=20)
    seat_number = models.CharField(max_length=10)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    train_class = models.CharField(max_length=5)
    route = models.CharField(max_length=255)
    status = models.CharField(max_length=20)
    booking_date = models.DateField(auto_now_add=True)

class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ticket_id = models.CharField(max_length=10)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    convenienceFee = models.DecimalField(max_digits=4, decimal_places=2)
    status = models.CharField(max_length=20)
