// script.js
import supabase from './supabase.js';

// search-a-person page
const submitPersonBtn = document.getElementById("search-person");
const resultsDiv = document.getElementById("results");
const messageDiv = document.getElementById("message");

const nameInput = document.getElementById("name");
const licenseInput = document.getElementById("license");

submitPersonBtn.onclick = async function() 
{
  if (!validatePeopleSearchForm()){
    messageDiv.innerHTML = `<h3>Error</h3>`
    resultsDiv.innerHTML = ``
  } else {
    try {
    const driverName = nameInput.value.trim();
    const licensePlate = licenseInput.value.trim();


    // select all values from the People table
    let query = supabase.from('People').select('*');
    if (driverName && licensePlate) 
    {
      query = query.ilike('Name', `%${driverName}%`).ilike('LicenseNumber', `%${licensePlate}%`);
    } else if (driverName) {
      query = query.ilike('Name', `%${driverName}%`);
    } else {
      query = query.ilike('LicenseNumber', `%${licensePlate}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
      displayPeopleResults(data);
    } catch (error) {
      console.error('Search error:', error);
      messageDiv.innerHTML = `<h3>Error:</h3>`
  }
  }
}

function validatePeopleSearchForm() {
  const name = nameInput.value.trim();
  const license = licenseInput.value.trim();

  if (name === "" && license === "") {
    console.error("Please fill in either the name or license field.");
    return false;
  }

  if (name !== "" && license !== "") {
    console.error("Please fill only one field — not both.");
    return false;
  }

  console.log("Valid input. Proceeding with search.");
  return true;
}

function displayPeopleResults(people) {
  if (people.length == 0)
  {
    messageDiv.innerHTML = `<h3>No result found</h3>`
  }else{
    messageDiv.innerHTML = `<h3>Search successful</h3>`
    resultsDiv.innerHTML = `
    <h4>Found ${people.length} matching record(s):</h4>
    <div class="results-grid">
      ${people.map(person => `
        <div class="card">
          <h4>${person.Name ||'Unknown'}</h4>
          ${person.LicenseNumber ? `<p><strong>License number:</strong> ${person.LicenseNumber}</p>` : ''}
          ${person.Address ? `<p><strong>Address:</strong> ${person.Address}</p>` : ''}
          ${person.DOB ? `<p><strong>Date of Birth:</strong> ${person.DOB}</p>` : ''}
          ${person.ExpiryDate ? `<p><strong>Expiry Date:</strong> ${person.ExpiryDate}</p>` : ''}
        </div>
      `).join('')}
    </div>`;
  }

  
}
