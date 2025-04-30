export interface JobData {
    job_id: string;
    job_title: string;
    employer_name: string;
    job_city?: string | null;
    job_state?: string | null;
    job_country?: string | null;
    job_apply_link: string;
  }
  
  export async function fetchJobs(location: string): Promise<JobData[]> {
    const role = "Developer"; // default role
    const query = encodeURIComponent(`${role} in ${location}`);
  
    const url = `https://jsearch.p.rapidapi.com/search?query=${query}&page=1&num_pages=1&fetch_full_text=false`;
  
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "9c4d278a11mshfc7ac6bc52863b6p1e4084jsn723f1bbbfa2d", // replace if needed
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    };
  
    try {
      console.log("Fetching jobs with URL:", url);
      const response = await fetch(url, options);
  
      if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}`, await response.text());
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      if (result && Array.isArray(result.data)) {
        const validJobs = result.data.filter((job: JobData) =>
          job && job.job_id && job.job_apply_link
        );
  
        if (validJobs.length !== result.data.length) {
          console.warn("Some jobs were filtered out due to missing job_id or job_apply_link.");
        }
  
        return validJobs;
      } else {
        console.warn("Unexpected response format from API:", result);
        return [];
      }
    } catch (error) {
      console.error("Error fetching jobs API:", error);
      return [];
    }
  }
  