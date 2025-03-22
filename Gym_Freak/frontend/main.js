$(document).ready(function () {
    $("#exerciseSearch").on("input", function () {
        let query = $(this).val().trim();

        if (query.length > 0) {
            $.ajax({
                url: "/api/get_exercises/",
                type: "GET",
                data: { q: query },
                success: function (data) {
                    $("#searchResults").empty();

                    if (data.length > 0) {
                        data.forEach(exercise => {
                            $("#searchResults").append(`
                                <div class="search-result-item">
                                    <h3>${exercise.name}</h3>
                                    <p>${exercise.target}</p>
                                    <button class="view-exercise-details" data-id="${exercise.id}">View Details</button>
                                </div>
                            `);
                        });
                    } else {
                        $("#searchResults").html("<p>No exercises found.</p>");
                    }
                },
                error: function () {
                    $("#searchResults").html("<p>Error fetching exercises.</p>");
                }
            });
        } else {
            $("#searchResults").empty();
        }
    });

    // Clear search input
    $("#clearSearch").on("click", function () {
        $("#exerciseSearch").val("");
        $("#searchResults").empty();
    });
});
