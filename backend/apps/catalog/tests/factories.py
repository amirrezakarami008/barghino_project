from __future__ import annotations

import factory

from apps.catalog.models import Equipment, EquipmentCategory, EquipmentPriceMode, SellPlan


class EquipmentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Equipment

    name = factory.Sequence(lambda n: f"Equipment {n}")
    category = EquipmentCategory.MOUNTING
    brand = "Test brand"
    price_toman = 100_000
    price_mode = EquipmentPriceMode.FIXED


class SellPlanFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SellPlan

    name = factory.Sequence(lambda n: f"Sell plan {n}")
    description = "Test-only plan"
    commitment_kwh = "100.500"
    rate_toman_per_kwh = "10.250"
    benefits = factory.LazyFunction(lambda: ["Test benefit"])
