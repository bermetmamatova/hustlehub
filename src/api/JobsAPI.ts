// src/api/jobsApi.ts

export async function fetchJobs(location: string, company: string, role: string) {
    const url = `https://jsearch.p.rapidapi.com/search?query=${role} ${company} in ${location}&page=1&num_pages=1`;

    const options = {
        method: "GET",
        headers: {
            "X-RapidAPI-Key": " a9ead4e820mshe4d6e67007f7e2ep127aacjsn9e34dde8a9cc",
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result.data; // This will contain an array of jobs
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return [];
    }
}
