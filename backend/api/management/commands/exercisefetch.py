from django.core.management.base import BaseCommand
from ...utils.fetchexercise import fetch_and_save_exercises


class Command(BaseCommand):
    help = "Fetch all exercises from API and save to database"

    def handle(self, *args, **kwargs):
        fetch_and_save_exercises()
        self.stdout.write(self.style.SUCCESS("Successfully fetched and saved exercises"))