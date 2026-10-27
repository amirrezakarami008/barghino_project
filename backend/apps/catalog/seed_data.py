"""PLACEHOLDER — replace with product values before enabling plans in production.

These are deliberately inactive and contain no real Bargino commercial terms.
Keep this migration seed stable; use a new migration for subsequent seed changes.
"""

from decimal import Decimal

PLACEHOLDER_SELL_PLANS = (
    {
        "name": "پایه",
        "description": "PLACEHOLDER — توضیحات واقعی پلن پایه ثبت نشده است.",
        "commitment_kwh": Decimal("1.000"),
        "rate_toman_per_kwh": Decimal("1.000"),
        "savings_text": "PLACEHOLDER — متن صرفه‌جویی باید جایگزین شود.",
        "benefits": ["PLACEHOLDER — مزایای واقعی باید جایگزین شوند."],
        "is_recommended": False,
        "is_active": False,
        "sort_order": 1,
    },
    {
        "name": "استاندارد",
        "description": "PLACEHOLDER — توضیحات واقعی پلن استاندارد ثبت نشده است.",
        "commitment_kwh": Decimal("1.000"),
        "rate_toman_per_kwh": Decimal("1.000"),
        "savings_text": "PLACEHOLDER — متن صرفه‌جویی باید جایگزین شود.",
        "benefits": ["PLACEHOLDER — مزایای واقعی باید جایگزین شوند."],
        "is_recommended": True,
        "is_active": False,
        "sort_order": 2,
    },
    {
        "name": "ویژه",
        "description": "PLACEHOLDER — توضیحات واقعی پلن ویژه ثبت نشده است.",
        "commitment_kwh": Decimal("1.000"),
        "rate_toman_per_kwh": Decimal("1.000"),
        "savings_text": "PLACEHOLDER — متن صرفه‌جویی باید جایگزین شود.",
        "benefits": ["PLACEHOLDER — مزایای واقعی باید جایگزین شوند."],
        "is_recommended": False,
        "is_active": False,
        "sort_order": 3,
    },
)
