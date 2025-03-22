from django import forms
from .models import WorkoutTracking, Exercise

class WorkoutTrackingForm(forms.ModelForm):
    workout_images = forms.FileField(
        widget=forms.ClearableFileInput(attrs={'multiple': True}),  # Allow multiple files
        required=False
    )

    class Meta:
        model = WorkoutTracking
        fields = ['workout', 'exercise', 'workout_date', 'sets', 'reps', 'duration', 'calories_burned', 'workout_notes']
        widgets = {
            'workout_date': forms.DateInput(attrs={'type': 'date'}),
        }

    # Custom validation for sets
    def clean_sets(self):
        sets = self.cleaned_data.get('sets')
        if not sets:
            raise forms.ValidationError("You must specify at least one set.")
        return sets

    # Optional: Add more validation for reps, duration, and calories_burned if needed
    def clean_reps(self):
        reps = self.cleaned_data.get('reps')
        if reps and reps <= 0:
            raise forms.ValidationError("Reps must be a positive integer.")
        return reps

    def clean_duration(self):
        duration = self.cleaned_data.get('duration')
        if duration and duration.total_seconds() <= 0:
            raise forms.ValidationError("Duration must be a positive value.")
        return duration

    def clean_calories_burned(self):
        calories_burned = self.cleaned_data.get('calories_burned')
        if calories_burned and calories_burned < 0:
            raise forms.ValidationError("Calories burned cannot be negative.")
        return calories_burned
