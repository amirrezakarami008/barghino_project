import factory
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.accounts.tests.factories import UserFactory
from apps.files.models import FilePurpose, FileVisibility, StoredFile


class StoredFileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = StoredFile

    owner = factory.SubFactory(UserFactory)
    original_name = "photo.jpg"
    content_type = "image/jpeg"
    size_bytes = 4
    purpose = FilePurpose.DOCUMENT
    visibility = FileVisibility.PRIVATE
    file = factory.LazyAttribute(
        lambda o: SimpleUploadedFile(
            o.original_name,
            b"\xff\xd8\xff\xd9",
            content_type=o.content_type,
        )
    )
