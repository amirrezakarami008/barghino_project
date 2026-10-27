import factory

from apps.accounts.tests.factories import UserFactory
from apps.contracts.models import Contract


class ContractFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Contract

    owner = factory.SubFactory(UserFactory)
