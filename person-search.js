// script.js
import supabase from './supabase.js';

// search a person page
const submitPersonBtn = document.getElementById("search-person");
const resultsDiv = document.getElementById("results");
const messageDiv = document.getElementById("message");

const nameInput = document.getElementById("name");
const licenseInput = document.getElementById("license");

submitPersonBtn.onclick = async function () {
  clearMessage(messageDiv);
  resultsDiv.innerHTML = '';

  if (!validatePeopleSearchForm()) return;

  try {
    const driverName = nameInput.value.trim();
    const licensePlate = licenseInput.value.trim();

    let query = supabase.from('People').select('*');

    if (driverName && licensePlate) {
      query = query
        .ilike('Name', `%${driverName}%`)
        .ilike('LicenseNumber', `%${licensePlate}%`);
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
    showMessage(messageDiv, "An error occurred while searching.", true);
  }
};

// validate form input
function validatePeopleSearchForm() {
  const name = nameInput.value.trim();
  const license = licenseInput.value.trim();

  if (!name && !license) {
    showMessage(messageDiv, "Please enter a name or license number to search.", true);
    return false;
  }

  if (name && license) {
    showMessage(messageDiv, "Please enter either a name or license number, not both.", true);
    return false;
  }

  return true;
}

// display results
function displayPeopleResults(people) {
  if (people.length === 0) {
    showMessage(messageDiv, "No results found.", true);
    resultsDiv.innerHTML = '';
    return;
  }

  showMessage(messageDiv, "Search successful!", false);

resultsDiv.innerHTML = `
  <h4>Found ${people.length} matching record(s):</h4>
  <div class="results-grid">
    ${people.map(person => `
      <div class="card">
        <h4>${person.Name || 'Unknown'}</h4>
        ${person.LicenseNumber ? `<p><strong>License number:</strong> ${person.LicenseNumber}</p>` : ''}
        ${person.Address ? `<p><strong>Address:</strong> ${person.Address}</p>` : ''}
        ${person.DOB ? `<p><strong>Date of Birth:</strong> ${person.DOB}</p>` : ''}
        ${person.ExpiryDate ? `<p><strong>Expiry Date:</strong> ${person.ExpiryDate}</p>` : ''}
      </div>
    `).join('')}
  </div>
`;

}



// show message to user
function showMessage(target, text, isError = false) {
  target.textContent = text;
  target.className = `message ${isError ? 'error' : 'success'}`;
}

// clear message from screen
function clearMessage(target) {
  target.textContent = '';
  target.className = 'message';
}
