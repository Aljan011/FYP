from django.core.management.base import BaseCommand
from api.models import Exercise, Achievement

class Command(BaseCommand):
    help = 'Create PB_WEIGHT and PB_REPS achievements per exercise'

    def handle(self, *args, **options):
        exercises = Exercise.objects.all()
        created = 0

        for ex in exercises:
            # PB_WEIGHT
            code_weight = f"PB_WEIGHT_{ex.id}"
            _, created_weight = Achievement.objects.get_or_create(
                code=code_weight,
                defaults={
                    "name": f"PB Weight - {ex.name}",
                    "description": f"Lifted heaviest weight yet on {ex.name}",
                }
            )

            # PB_REPS
            code_reps = f"PB_REPS_{ex.id}"
            _, created_reps = Achievement.objects.get_or_create(
                code=code_reps,
                defaults={
                    "name": f"PB Reps - {ex.name}",
                    "description": f"Performed most reps yet on {ex.name}",
                }
            )

            if created_weight or created_reps:
                created += 1

        self.stdout.write(self.style.SUCCESS(f"{created} achievements created or already exist."))
