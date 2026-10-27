import factory
from django.contrib.auth.hashers import make_password

from apps.accounts.models import User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("phone",)

    phone = factory.Sequence(lambda n: f"0912{n:07d}")
    username = factory.LazyAttribute(lambda obj: obj.phone)
    email = factory.LazyAttribute(lambda obj: f"{obj.phone}@example.com")
    password = factory.LazyFunction(lambda: make_password("testpass123"))
    token_version = 0
