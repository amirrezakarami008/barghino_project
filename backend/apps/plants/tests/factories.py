from decimal import Decimal

import factory

from apps.accounts.tests.factories import UserFactory
from apps.plants.models import Branch, BranchStatus, Plant, PlantStatus


class BranchFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Branch

    owner = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f"Branch {n}")
    meter_number = factory.Sequence(lambda n: f"MTR{n:08d}")
    address = "Tehran, Sample St 1"
    status = BranchStatus.ACTIVE


class PlantFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Plant

    owner = factory.LazyAttribute(lambda o: o.branch.owner)
    branch = factory.SubFactory(BranchFactory)
    name = factory.Sequence(lambda n: f"Plant {n}")
    address = "Tehran, Rooftop 1"
    capacity_kwp = Decimal("5.500")
    commissioned_at = None
    status = PlantStatus.PENDING
