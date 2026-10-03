from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Import legacy database inventory workbook"

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.WARNING(
                "Excel import will be implemented after the MVP deployment is validated."
            )
        )
