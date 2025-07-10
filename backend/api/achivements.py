from django.utils.timezone import now
from django.db.models import Max
from .models import Achievement, UserAchievement, Workout, WorkoutExerciseSet

def award_achievement(user, code):
    """Award a specific achievement to a user if not already earned."""
    try:
        achievement = Achievement.objects.get(code=code)
        UserAchievement.objects.get_or_create(user=user, achievement=achievement)
    except Achievement.DoesNotExist:
        # If the achievement wasn't created yet, you might want to log it or skip
        pass

def check_personal_bests(user, current_workout):
    """
    Check for personal bests (PBs) per exercise in the current workout.
    Awards PB_WEIGHT_{exercise.id} and PB_REPS_{exercise.id}.
    """
    awarded_codes = set()
    exercises = current_workout.exercises.all()

    for ex in exercises:
        # Get current session sets
        sets = WorkoutExerciseSet.objects.filter(
            workout_session=current_workout.session,
            exercise=ex
        )

        max_reps = max([s.reps for s in sets])
        max_weight = max([s.weight or 0 for s in sets])

        # Get previous sets (exclude current workout)
        previous_sets = WorkoutExerciseSet.objects.filter(
            workout_session__user=user,
            exercise=ex
        ).exclude(workout_session=current_workout.session)

        # Skip PBs for first-time exercises
        if not previous_sets.exists():
            continue

        previous_max_reps = previous_sets.aggregate(Max("reps"))["reps__max"] or 0
        previous_max_weight = previous_sets.aggregate(Max("weight"))["weight__max"] or 0

        if max_reps > previous_max_reps:
            code = f"PB_REPS_{ex.id}"
            award_achievement(user, code)
            awarded_codes.add(code)

        if max_weight > previous_max_weight:
            code = f"PB_WEIGHT_{ex.id}"
            award_achievement(user, code)
            awarded_codes.add(code)

    return awarded_codes

def check_achievements(user, current_workout=None):
    """
    Main entry to check and award achievements.
    This handles streaks, first PB, workout milestones, and optionally PBs from a current workout.
    """
    workouts = Workout.objects.filter(user=user).order_by('-created_at')

    # 1. 5-Day Streak
    dates = workouts.values_list('created_at', flat=True)
    streak = 1
    for i in range(1, len(dates)):
        if (dates[i - 1].date() - dates[i].date()).days == 1:
            streak += 1
        else:
            break
    if streak >= 5:
        award_achievement(user, '5_DAY_STREAK')

    # 2. First Personal Best (any PB in any workout)
    if workouts.filter(personal_best__isnull=False).exists():
        award_achievement(user, 'FIRST_PB')

    # 3. Logged 10 workouts
    if workouts.count() >= 10:
        award_achievement(user, 'TEN_WORKOUTS')

    # 4. Optional: Personal bests (reps/weight) for specific exercises
    if current_workout:
        check_personal_bests(user, current_workout)
